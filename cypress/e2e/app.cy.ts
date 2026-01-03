/// <reference types="cypress" />

describe('Expense Analyzer App', () => {
  it('should load and display step 1 with empty CSV input', () => {
    cy.visit('/')
    cy.contains('Expense Analyzer').should('be.visible')
    cy.contains('Step 1: Paste CSV Content').should('be.visible')
    cy.get('textarea').should('be.visible')
    cy.get('textarea').should('be.empty')
    cy.contains('Fill with Example Data').should('be.visible')
    cy.get('select#delimiter-select').should('be.visible')
    cy.get('select#delimiter-select').should('have.value', ';')
  })

  it('should fill textarea with example data when button is clicked', () => {
    cy.visit('/')
    cy.get('textarea').should('be.empty')
    cy.contains('Fill with Example Data').click()
    cy.get('textarea').should('not.be.empty')
  })

  it('should show preview of first 3 rows when CSV is entered', () => {
    cy.visit('/')
    cy.get('textarea').type('date;description;account;category;amount\n2025-01-01;Test 1;Account1;Cat1;100.00\n2025-01-02;Test 2;Account2;Cat2;200.00\n2025-01-03;Test 3;Account3;Cat3;300.00')
    cy.contains('Preview (first 3 rows)').should('be.visible')
    cy.get('table.transaction-table tbody tr').should('have.length', 3)
    cy.get('table.transaction-table thead th').should('have.length', 7) // 7 columns: Exclude, Date, Description, Account, Category, Amount, Status
  })


  it('should navigate through all steps', () => {
    cy.visit('/')
    // Fill with example data first
    cy.contains('Fill with Example Data').click()
    // Step 1 -> Step 2
    cy.contains('Next').click()
    cy.contains('Step 2: Exclude Transactions').should('be.visible')
    cy.get('table.transaction-table').should('be.visible')
    cy.get('table.transaction-table tbody tr').should('have.length.at.least', 1)

    // Step 2 -> Step 3
    cy.contains('Next').click()
    cy.contains('Step 3: Summary').should('be.visible')
    cy.get('select#month-select').should('be.visible')
    cy.contains(/\w+ \d{4}/).should('be.visible') // Month Year format
  })

  it('should allow going back to previous steps', () => {
    cy.visit('/')
    // Fill with example data first
    cy.contains('Fill with Example Data').click()
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
    // Fill with example data and navigate to step 3
    cy.contains('Fill with Example Data').click()
    cy.contains('Next').click()
    cy.contains('Step 2: Exclude Transactions').should('be.visible')
    cy.contains('Next').click()
    cy.contains('Step 3: Summary').should('be.visible')

    // Click clear button
    cy.contains('Clear & Start Over').click()

    // Should be back at step 1 with empty textarea
    cy.contains('Step 1: Paste CSV Content').should('be.visible')
    cy.get('textarea').should('be.empty')

    // Reload and verify it's still cleared
    cy.reload()
    cy.contains('Step 1: Paste CSV Content').should('be.visible')
    cy.get('textarea').should('be.empty')
  })
})

