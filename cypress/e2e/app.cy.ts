/// <reference types="cypress" />

describe('Expense Analyzer App', () => {
  it('should load and display step 1 with CSV input', () => {
    cy.visit('/')
    cy.contains('Expense Analyzer').should('be.visible')
    cy.contains('Step 1: Paste CSV Content').should('be.visible')
    cy.get('textarea').should('be.visible')
    cy.get('textarea').should('not.be.empty')
  })

  it('should navigate through all steps', () => {
    cy.visit('/')
    // Step 1 -> Step 2
    cy.contains('Next').click()
    cy.contains('Step 2: Exclude Transactions').should('be.visible')
    cy.get('table.transaction-table').should('be.visible')
    cy.get('table.transaction-table tbody tr').should('have.length.at.least', 1)
    
    // Step 2 -> Step 3
    cy.contains('Next').click()
    cy.contains('Step 3: Summary').should('be.visible')
    cy.contains('Month:').should('be.visible')
  })

  it('should allow going back to previous steps', () => {
    cy.visit('/')
    // Go to step 2
    cy.contains('Next').click()
    cy.contains('Step 2: Exclude Transactions').should('be.visible')
    
    // Go back to step 1
    cy.contains('Back').click()
    cy.contains('Step 1: Paste CSV Content').should('be.visible')
    
    // Go forward again
    cy.contains('Next').click()
    cy.contains('Step 2: Exclude Transactions').should('be.visible')
    
    // Go to step 3
    cy.contains('Next').click()
    cy.contains('Step 3: Summary').should('be.visible')
    
    // Go back to step 2
    cy.contains('Back').click()
    cy.contains('Step 2: Exclude Transactions').should('be.visible')
  })

  it('should persist data to localStorage and restore on reload', () => {
    cy.visit('/')
    // Modify CSV
    cy.get('textarea').clear().type('2025-01-01;"Test Transaction";"Account";"Category";-100,00 PLN;;')
    cy.contains('Next').click()
    cy.contains('Step 2: Exclude Transactions').should('be.visible')
    
    // Exclude a transaction
    cy.get('input[type="checkbox"]').first().check()
    
    // Reload page
    cy.reload()
    
    // Should restore to step 2
    cy.contains('Step 2: Exclude Transactions').should('be.visible')
    // Checkbox should still be checked
    cy.get('input[type="checkbox"]').first().should('be.checked')
  })

  it('should clear data and reset to step 1', () => {
    cy.visit('/')
    // Navigate to step 3
    cy.contains('Next').click()
    cy.contains('Step 2: Exclude Transactions').should('be.visible')
    cy.contains('Next').click()
    cy.contains('Step 3: Summary').should('be.visible')
    
    // Click clear button
    cy.contains('Clear & Start Over').click()
    
    // Should be back at step 1 with initial CSV
    cy.contains('Step 1: Paste CSV Content').should('be.visible')
    cy.get('textarea').should('not.be.empty')
    
    // Reload and verify it's still cleared
    cy.reload()
    cy.contains('Step 1: Paste CSV Content').should('be.visible')
  })
})

