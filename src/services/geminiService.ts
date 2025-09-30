import type { GeminiResponse } from '../types'

// Note: In production, store API key in environment variables
// To fix the 400 error, you need to:
// 1. Get a valid Gemini API key from Google AI Studio
// 2. Set EXPO_PUBLIC_GEMINI_API_KEY environment variable
// 3. Or replace 'your_gemini_api_key_here' with your actual API key
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'your_gemini_api_key_here'
// Updated to use gemini-2.5-flash as per Google AI documentation
// Alternative models: gemini-2.5-flash, gemini-1.5-pro
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const FALLBACK_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'

export class GeminiService {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GEMINI_API_KEY
  }

  // Test method to verify API connection
  async testConnection(): Promise<boolean> {
    try {
      if (this.apiKey === 'your_gemini_api_key_here') {
        console.warn('Gemini API key not configured. Connection test skipped.')
        console.warn('To fix: Set EXPO_PUBLIC_GEMINI_API_KEY environment variable or update the API key in geminiService.ts')
        return false
      }
      
      console.log('Testing Gemini API connection with key:', this.apiKey.substring(0, 10) + '...')

      let response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, this is a test message.'
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          }
        })
      })

      if (response.ok) {
        console.log('Gemini API connection test successful')
        return true
      } else if (response.status === 404) {
        // Try fallback model
        console.log('Primary model not found, trying fallback model for connection test...')
        response = await fetch(FALLBACK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Hello, this is a test message.'
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 10,
            }
          })
        })
        
        if (response.ok) {
          console.log('Gemini API connection test successful with fallback model')
          return true
        }
      }
      
      const errorText = await response.text()
      console.error('Gemini API connection test failed:', response.status, errorText)
      return false
    } catch (error) {
      console.error('Gemini API connection test error:', error)
      return false
    }
  }

  async analyzePropLine(
    player: string,
    propType: string,
    customLine: number,
    sport: string = 'football',
    marketLine?: number,
    eventsData?: string
  ): Promise<GeminiResponse> {
    try {
      // Check if API key is properly configured
      if (this.apiKey === 'your_gemini_api_key_here') {
        console.warn('Gemini API key not configured. Using mock analysis.')
        console.warn('To fix: Set EXPO_PUBLIC_GEMINI_API_KEY environment variable or update the API key in geminiService.ts')
        return this.getMockAnalysis(player, propType, customLine)
      }

      const prompt = eventsData 
        ? this.buildLiveAnalysisPrompt(player, propType, customLine, sport, eventsData)
        : this.buildAnalysisPrompt(player, propType, customLine, sport, marketLine)
      
      console.log('Gemini Service: Making API call with prompt:', prompt.substring(0, 200) + '...')
      
      // Try primary URL first, then fallback if it fails
      let response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
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
            maxOutputTokens: 1000,
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
        const errorText = await response.text()
        console.error('Gemini API error response:', errorText)
        console.error('Gemini API status:', response.status)
        console.error('Gemini API URL:', GEMINI_API_URL)
        
        // If primary model fails with 404, try fallback model
        if (response.status === 404) {
          console.log('Primary model not found, trying fallback model...')
          response = await fetch(FALLBACK_API_URL, {
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
                maxOutputTokens: 1000,
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
            const fallbackErrorText = await response.text()
            console.error('Fallback model also failed:', fallbackErrorText)
            throw new Error(`Gemini API error: ${response.status} - ${fallbackErrorText}`)
          }
        } else {
          // Parse error response for better error messages
          try {
            const errorData = JSON.parse(errorText)
            if (errorData.error) {
              throw new Error(`Gemini API error: ${errorData.error.message || errorText}`)
            }
          } catch (parseError) {
            // If we can't parse the error, use the raw text
          }
          
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
        }
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
        
        Example: "Carson Beck finished with 285 passing yards, crushing the over 275.5! The line creator called it perfectly as Beck dominated in the fourth quarter."
      `

      let response = await fetch(`${GEMINI_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
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
        // Try fallback model if primary fails
        if (response.status === 404) {
          response = await fetch(FALLBACK_API_URL, {
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
        }
        
        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`)
        }
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

      let response = await fetch(`${GEMINI_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
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
        // Try fallback model if primary fails
        if (response.status === 404) {
          response = await fetch(FALLBACK_API_URL, {
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
        }
        
        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`)
        }
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 
        `Try ${(currentLine - 0.5).toFixed(1)} for better match likelihood`
    } catch (error) {
      console.error('Gemini suggestion failed:', error)
      return `Try ${(currentLine - 0.5).toFixed(1)} for better match likelihood`
    }
  }

  private buildLiveAnalysisPrompt(
    player: string,
    propType: string,
    customLine: number,
    sport: string,
    eventsData: string
  ): string {
    return `Analyze this live bet: ${player} ${propType} ${customLine}. Events: ${eventsData}. 

Respond in JSON:
{
  "fairValue": ${customLine},
  "explanation": "GOOD BET or AVOID: [1-2 sentences]",
  "confidence": 0.8,
  "suggestedLine": null,
  "marketComparison": "brief comparison",
  "riskAssessment": "LOW/MEDIUM/HIGH"
}`
  }

  private buildAnalysisPrompt(
    player: string,
    propType: string,
    customLine: number,
    sport: string,
    marketLine?: number
  ): string {
    return `Analyze: ${player} ${propType} ${customLine}${marketLine ? ` (market: ${marketLine})` : ''}.

Respond in JSON:
{
  "fairValue": ${customLine},
  "explanation": "GOOD BET or AVOID: [brief reasoning]",
  "confidence": 0.8,
  "suggestedLine": null,
  "marketComparison": "brief comparison",
  "riskAssessment": "LOW/MEDIUM/HIGH"
}`
  }

  private parseGeminiResponse(apiResponse: any, fallbackLine: number): GeminiResponse {
    try {
      console.log('Raw Gemini API response:', JSON.stringify(apiResponse, null, 2))
      
      const responseText = apiResponse.candidates?.[0]?.content?.parts?.[0]?.text
      if (!responseText) {
        console.error('No response text found in API response')
        throw new Error('No response text')
      }

      console.log('Response text:', responseText)

      // Try to parse JSON response
      const jsonStart = responseText.indexOf('{')
      const jsonEnd = responseText.lastIndexOf('}') + 1
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonText = responseText.slice(jsonStart, jsonEnd)
        console.log('Extracted JSON text:', jsonText)
        
        try {
          const parsed = JSON.parse(jsonText)
          console.log('Parsed JSON:', parsed)
          
          return {
            fairValue: parsed.fairValue || fallbackLine - 1,
            explanation: parsed.explanation || 'Analysis based on recent performance trends',
            confidence: parsed.confidence || 0.75,
            suggestedLine: parsed.suggestedLine,
            marketComparison: parsed.marketComparison,
            riskAssessment: parsed.riskAssessment
          }
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError)
          console.error('Failed to parse JSON text:', jsonText)
        }
      }
      
      // If no JSON found, try to extract information from plain text
      console.log('No JSON found, trying to extract from plain text')
      return this.parsePlainTextResponse(responseText, fallbackLine)
      
    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      return this.getMockAnalysis('Unknown Player', 'passing_yards', fallbackLine)
    }
  }

  private parsePlainTextResponse(text: string, fallbackLine: number): GeminiResponse {
    // Try to extract key information from plain text response
    const fairValueMatch = text.match(/fair[^:]*:?\s*(\d+\.?\d*)/i)
    const confidenceMatch = text.match(/confidence[^:]*:?\s*(\d+\.?\d*)/i)
    const riskMatch = text.match(/risk[^:]*:?\s*(low|medium|high)/i)
    
    const fairValue = fairValueMatch ? parseFloat(fairValueMatch[1]) : fallbackLine - 1
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75
    const riskAssessment = riskMatch ? riskMatch[1].toUpperCase() : 'MEDIUM'
    
    return {
      fairValue,
      explanation: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      confidence: Math.min(1, Math.max(0, confidence)),
      suggestedLine: fairValue,
      marketComparison: fairValue > fallbackLine ? 'Your line is below fair value' : 'Your line is above fair value',
      riskAssessment
    }
  }

  private getMockAnalysis(player: string, propType: string, customLine: number): GeminiResponse {
    const fairValue = customLine - (Math.random() * 3 - 1.5)
    const confidence = 0.7 + Math.random() * 0.25
    const isGoodBet = Math.random() > 0.5
    
    const recommendation = isGoodBet ? 'GOOD BET' : 'AVOID'
    const reasoning = isGoodBet 
      ? `${player} is trending well and the line looks favorable based on recent performance.`
      : `Current conditions suggest this line may be too aggressive. Consider waiting for better value.`
    
    return {
      fairValue: parseFloat(fairValue.toFixed(1)),
      explanation: `${recommendation}: ${reasoning}`,
      confidence: parseFloat(confidence.toFixed(2)),
      suggestedLine: parseFloat((customLine - 0.5).toFixed(1)),
      marketComparison: customLine > fairValue ? 'Your line is above fair value' : 'Your line is below fair value',
      riskAssessment: customLine > fairValue + 1 ? 'HIGH' : 'MEDIUM'
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService()

// Export utility functions
export const initializeGeminiService = (apiKey: string) => {
  return new GeminiService(apiKey)
}
