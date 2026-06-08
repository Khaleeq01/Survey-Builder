/**
 * Basic tests for validation utilities
 * Run with: node api/src/validation.test.js
 */

import { validateEmail, safeJsonParse, validateObject } from './validation.js'

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
  console.log(`✓ ${message}`)
}

function testValidateEmail() {
  console.log('\n=== Testing validateEmail ===')

  // Happy path
  assert(validateEmail('user@example.com'), 'Valid email should pass')
  assert(validateEmail('  user@example.com  '), 'Email with whitespace should pass after trim')
  assert(validateEmail('first.last@example.co.uk'), 'Email with subdomain should pass')

  // Edge cases that should fail
  assert(!validateEmail('@'), 'Just @ should fail')
  assert(!validateEmail('user@'), 'Missing domain should fail')
  assert(!validateEmail('@example.com'), 'Missing local part should fail')
  assert(!validateEmail('user example@test.com'), 'Email with space should fail')
  assert(!validateEmail('userexample.com'), 'Missing @ should fail')
}

function testSafeJsonParse() {
  console.log('\n=== Testing safeJsonParse ===')

  // Happy path
  const obj = { name: 'test', value: 42 }
  const parsed = safeJsonParse(JSON.stringify(obj))
  assert(parsed?.name === 'test', 'Should parse valid JSON')
  assert(parsed?.value === 42, 'Should preserve numeric values')

  // Malformed JSON
  const invalid = safeJsonParse('{ invalid json }')
  assert(invalid === null, 'Malformed JSON should return null')

  // Fallback value
  const fallback = safeJsonParse('bad json', { default: true })
  assert(fallback.default === true, 'Should return fallback on parse error')

  // Empty string
  const empty = safeJsonParse('')
  assert(empty === null, 'Empty string should return null')
}

function testValidateObject() {
  console.log('\n=== Testing validateObject ===')

  // Happy path
  const validObj = { id: '123', email: 'user@example.com' }
  assert(validateObject(validObj, ['id', 'email']), 'Object with required keys should pass')

  // Missing required key
  const missingKey = { id: '123' }
  assert(!validateObject(missingKey, ['id', 'email']), 'Object missing required key should fail')

  // Extra keys are allowed
  const extraKeys = { id: '123', email: 'user@example.com', extra: 'value' }
  assert(validateObject(extraKeys, ['id', 'email']), 'Object with extra keys should pass')

  // Not an object
  assert(!validateObject('not an object', ['id']), 'String should not validate as object')
  assert(!validateObject(null, ['id']), 'Null should not validate as object')
  assert(!validateObject(undefined, ['id']), 'Undefined should not validate as object')
}

function runAllTests() {
  console.log('Running validation utility tests...')
  try {
    testValidateEmail()
    testSafeJsonParse()
    testValidateObject()
    console.log('\n All tests passed!')
  } catch (error) {
    console.error('\n Test failed:', error.message)
    process.exit(1)
  }
}

runAllTests()
