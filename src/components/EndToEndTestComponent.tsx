import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useAppStore } from '../store/useAppStore'
import type { EndToEndTestResults } from '../services/endToEndTestService'

export const EndToEndTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<EndToEndTestResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const runEndToEndTests = useAppStore(state => state.runEndToEndTests)

  const handleRunTests = async () => {
    setIsRunning(true)
    try {
      const results = await runEndToEndTests()
      setTestResults(results)
    } catch (error) {
      console.error('Tests failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return '#4CAF50'
      case 'FAIL': return '#F44336'
      case 'SKIP': return '#FF9800'
      default: return '#9E9E9E'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅'
      case 'FAIL': return '❌'
      case 'SKIP': return '⏭️'
      default: return '❓'
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>End-to-End Test Suite</Text>
      
      <TouchableOpacity 
        style={[styles.button, isRunning && styles.buttonDisabled]} 
        onPress={handleRunTests}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Text>
      </TouchableOpacity>

      {testResults && (
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Test Summary</Text>
            <Text style={[styles.summaryStatus, { color: getStatusColor(testResults.overallStatus) }]}>
              {getStatusIcon(testResults.overallStatus)} {testResults.overallStatus}
            </Text>
            <Text style={styles.summaryText}>
              {testResults.passedTests}/{testResults.totalTests} tests passed
            </Text>
            <Text style={styles.summaryText}>
              Duration: {testResults.totalDuration}ms
            </Text>
          </View>

          <View style={styles.testResults}>
            <Text style={styles.testResultsTitle}>Individual Test Results</Text>
            {testResults.results.map((result, index) => (
              <View key={index} style={styles.testResult}>
                <View style={styles.testHeader}>
                  <Text style={styles.testIcon}>
                    {getStatusIcon(result.status)}
                  </Text>
                  <Text style={styles.testName}>{result.testName}</Text>
                  <Text style={[styles.testStatus, { color: getStatusColor(result.status) }]}>
                    {result.status}
                  </Text>
                </View>
                <Text style={styles.testMessage}>{result.message}</Text>
                <Text style={styles.testDuration}>Duration: {result.duration}ms</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
  },
  summary: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  summaryStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  testResults: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  testResult: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 15,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  testName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  testStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  testMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  testDuration: {
    fontSize: 12,
    color: '#999',
  },
})
