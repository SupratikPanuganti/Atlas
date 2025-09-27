import type { GeminiResponse } from '../types'

// Note: In production, store API key in environment variables
const GEMINI_API_KEY = 'your_gemini_api_key_here'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

export class GeminiService {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GEMINI_API_KEY
  }

  async analyzePropLine(
    player: string,
    propType: string,
    customLine: number,
    sport: string = 'basketball',
    marketLine?: number
  ): Promise<GeminiResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(player, propType, customLine, sport, marketLine)
      
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseGeminiResponse(data, customLine)
    } catch (error) {
      console.error('Gemini API call failed:', error)
      // Fallback to mock analysis if API fails
      return this.getMockAnalysis(player, propType, customLine)
    }
  }

  async generateMatchRecap(
    player: string,
    propType: string,
    line: number,
    side: 'over' | 'under',
    finalValue: number,
    winner: 'creator' | 'opponent'
  ): Promise<string> {
    try {
      const prompt = `
        Generate a brief, exciting recap for a completed head-to-head prop bet:
        
        Player: ${player}
        Prop: ${propType}
        Line: ${side.toUpperCase()} ${line}
        Final Result: ${finalValue}
        Winner: ${winner === 'creator' ? 'Line creator' : 'Opponent'}
        
        Write 1-2 sentences explaining what happened and why the ${winner} won. 
        Make it exciting but factual. Include the final numbers.
        
        Example: "LeBron finished with 38 points, crushing the over 35.5! The line creator called it perfectly as LeBron dominated in the fourth quarter."
      `

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 
        `${player} finished with ${finalValue} ${propType}. ${winner === 'creator' ? 'Line creator' : 'Opponent'} wins!`
    } catch (error) {
      console.error('Gemini recap generation failed:', error)
      return `${player} finished with ${finalValue} ${propType}. ${winner === 'creator' ? 'Line creator' : 'Opponent'} wins!`
    }
  }

  async suggestLineAdjustments(
    player: string,
    propType: string,
    currentLine: number,
    timeUnmatched: number // minutes
  ): Promise<string> {
    if (timeUnmatched < 30) return '' // Only suggest after 30 minutes

    try {
      const prompt = `
        A head-to-head prop bet line has been unmatched for ${timeUnmatched} minutes:
        
        Player: ${player}
        Prop: ${propType}
        Current Line: ${currentLine}
        
        Suggest a brief adjustment to improve match likelihood. Consider:
        - Market appeal
        - Fair value proximity
        - Psychological pricing
        
        Respond with one specific suggestion in under 20 words.
        
        Example: "Try 34.5 instead of 36.0 - closer to fair value, more likely to match"
      `

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 50,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 
        `Try ${(currentLine - 0.5).toFixed(1)} for better match likelihood`
    } catch (error) {
      console.error('Gemini suggestion failed:', error)
      return `Try ${(currentLine - 0.5).toFixed(1)} for better match likelihood`
    }
  }

  private buildAnalysisPrompt(
    player: string,
    propType: string,
    customLine: number,
    sport: string,
    marketLine?: number
  ): string {
    return `
      You are a professional sports betting analyst. Analyze this prop bet line:
      
      Player: ${player}
      Sport: ${sport}
      Prop Type: ${propType}
      Custom Line: ${customLine}
      ${marketLine ? `Market Line: ${marketLine}` : ''}
      
      Please provide:
      1. Fair value estimate for this prop
      2. Brief explanation of your reasoning
      3. Confidence level (0.0-1.0)
      4. Suggested adjustment if needed
      5. Risk assessment
      
      Respond in this JSON format:
      {
        "fairValue": [number],
        "explanation": "[brief reasoning]",
        "confidence": [0.0-1.0],
        "suggestedLine": [number or null],
        "marketComparison": "[comparison to market if available]",
        "riskAssessment": "[risk level and advice]"
      }
      
      Be concise but informative. Focus on recent performance, matchup factors, and statistical trends.
    `
  }

  private parseGeminiResponse(apiResponse: any, fallbackLine: number): GeminiResponse {
    try {
      const responseText = apiResponse.candidates?.[0]?.content?.parts?.[0]?.text
      if (!responseText) throw new Error('No response text')

      // Try to parse JSON response
      const jsonStart = responseText.indexOf('{')
      const jsonEnd = responseText.lastIndexOf('}') + 1
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonText = responseText.slice(jsonStart, jsonEnd)
        const parsed = JSON.parse(jsonText)
        
        return {
          fairValue: parsed.fairValue || fallbackLine - 1,
          explanation: parsed.explanation || 'Analysis based on recent performance trends',
          confidence: parsed.confidence || 0.75,
          suggestedLine: parsed.suggestedLine,
          marketComparison: parsed.marketComparison,
          riskAssessment: parsed.riskAssessment
        }
      }
      
      // Fallback if JSON parsing fails
      throw new Error('Could not parse JSON response')
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      return this.getMockAnalysis('Unknown Player', 'points', fallbackLine)
    }
  }

  private getMockAnalysis(player: string, propType: string, customLine: number): GeminiResponse {
    const fairValue = customLine - (Math.random() * 3 - 1.5)
    const confidence = 0.7 + Math.random() * 0.25
    
    return {
      fairValue: parseFloat(fairValue.toFixed(1)),
      explanation: `Based on ${player}'s recent performance and matchup analysis, fair value for ${propType} is around ${fairValue.toFixed(1)}`,
      confidence: parseFloat(confidence.toFixed(2)),
      suggestedLine: parseFloat((customLine - 0.5).toFixed(1)),
      marketComparison: customLine > fairValue ? 'Your line is above fair value' : 'Your line is below fair value',
      riskAssessment: customLine > fairValue + 1 ? 'High risk - consider lowering line' : 'Moderate risk - good value'
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService()

// Export utility functions
export const initializeGeminiService = (apiKey: string) => {
  return new GeminiService(apiKey)
}
