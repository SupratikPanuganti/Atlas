import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { bettingService } from '../services/bettingService'
import { useAppStore } from '../store/useAppStore'

export function BetsTestComponent() {
  const { user, bets, setBets } = useAppStore()
  const [testResult, setTestResult] = useState<string>('')

  const testBetsTable = async () => {
    try {
      const result = await bettingService.testBetsTable()
      setTestResult(`Bets table test: ${result ? 'SUCCESS' : 'FAILED'}`)
    } catch (error) {
      setTestResult(`Bets table test: ERROR - ${error}`)
    }
  }

  const testCreateBet = async () => {
    if (!user) {
      setTestResult('No user logged in')
      return
    }

    try {
      // Use a known betting line ID from the logs
      const bettingLineId = 'ncaa-001' // Haynes King Pass Yds 245.5 over
      const newBet = await bettingService.createBetFromLine(user.id, bettingLineId, 50)
      
      setBets([newBet, ...bets])
      setTestResult(`Created bet: ${newBet.player} ${newBet.prop} ${newBet.line} ${newBet.betType}`)
    } catch (error) {
      setTestResult(`Create bet error: ${error}`)
    }
  }

  const testGetUserBets = async () => {
    if (!user) {
      setTestResult('No user logged in')
      return
    }

    try {
      const userBets = await bettingService.getUserBets(user.id)
      setTestResult(`Found ${userBets.length} user bets`)
    } catch (error) {
      setTestResult(`Get user bets error: ${error}`)
    }
  }

  const testFavoriteFunctionality = async () => {
    if (!user) {
      setTestResult('No user logged in')
      return
    }

    try {
      // Get all user bets
      const userBets = await bettingService.getUserBets(user.id)
      const activeBets = await bettingService.getActiveBets(user.id)
      const favoritedBets = await bettingService.getFavoritedBets(user.id)
      
      setTestResult(`Total: ${userBets.length}, Active: ${activeBets.length}, Favorited: ${favoritedBets.length}`)
      
      // Test unfavoriting if we have a bet
      if (userBets.length > 0) {
        const firstBet = userBets[0]
        console.log('Testing favorite functionality with bet:', firstBet)
        
        // Toggle favorite status
        const newFavoriteStatus = !firstBet.is_favorited
        await bettingService.updateBetFavoritedStatus(firstBet.id, newFavoriteStatus)
        
        // Reload to verify
        const updatedBets = await bettingService.getUserBets(user.id)
        const updatedActiveBets = await bettingService.getActiveBets(user.id)
        
        setTestResult(`Toggled favorite for ${firstBet.player}. Active bets now: ${updatedActiveBets.length}`)
      }
    } catch (error) {
      setTestResult(`Favorite test error: ${error}`)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bets Test Component</Text>
      <Text style={styles.userInfo}>User: {user?.email || 'Not logged in'}</Text>
      <Text style={styles.betCount}>Current bets: {bets.length}</Text>
      
      <TouchableOpacity style={styles.button} onPress={testBetsTable}>
        <Text style={styles.buttonText}>Test Bets Table</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testCreateBet}>
        <Text style={styles.buttonText}>Test Create Bet</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testGetUserBets}>
        <Text style={styles.buttonText}>Test Get User Bets</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testFavoriteFunctionality}>
        <Text style={styles.buttonText}>Test Favorite Functionality</Text>
      </TouchableOpacity>
      
      <Text style={styles.result}>{testResult}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 14,
    marginBottom: 5,
  },
  betCount: {
    fontSize: 14,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  result: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
})
