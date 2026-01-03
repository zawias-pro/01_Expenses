/// <reference types="cypress" />

describe('Expense Analyzer App', () => {
  it('should load and display the app', () => {
    cy.visit('/')
    cy.contains('Expense Analyzer').should('be.visible')
  })

  it('should display transactions table', () => {
    cy.visit('/')
    cy.get('table.transaction-table').should('be.visible')
    cy.get('table.transaction-table tbody tr').should('have.length.at.least', 1)
  })

  it('should process transactions and show summary', () => {
    cy.visit('/')
    cy.get('button.process-btn').click()
    cy.get('.modal-content').should('be.visible')
    cy.contains('Summary').should('be.visible')
  })
})

