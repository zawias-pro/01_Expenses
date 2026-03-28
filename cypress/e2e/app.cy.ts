/// <reference types="cypress" />

describe.skip('Expense Analyzer App', () => {
  it('should load and display CSV input view with empty CSV input', () => {
    cy.visit('/')
    cy.contains('Expense Analyzer').should('be.visible')
    cy.contains('CSV Input').should('be.visible')
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
    cy.get('table tbody tr').should('have.length', 3)
    cy.get('table thead th').should('have.length', 6) // 6 columns: Exclude, Date, Description, Category, Amount, Status
  })

  it('should navigate through all views', () => {
    cy.visit('/')
    // Fill with example data first
    cy.contains('Fill with Example Data').click()
    // Wait for data to be parsed
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    
    // Navigate to Transactions Table view
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
    cy.get('table tbody tr').should('have.length.at.least', 1)

    // Navigate to Data by Period view
    cy.contains('button', 'Data by Period').should('not.be.disabled').click()
    cy.contains('Data Aggregated by Period').should('be.visible')
    cy.get('select#selection-type-select').should('be.visible')
    cy.get('select#selection-type-select').should('have.value', 'month')
    cy.get('select#month-select').should('be.visible')
    cy.contains(/\w+ \d{4}/).should('be.visible') // Month Year format
  })

  it('should allow navigating between views', () => {
    cy.visit('/')
    // Fill with example data first
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    
    // Go to Transactions Table view
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')

    // Go back to CSV Input view
    cy.contains('button', 'CSV Input').click()
    cy.contains('CSV Input').should('be.visible')

    // Go to Transactions Table again
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')

    // Go to Data by Period view
    cy.contains('button', 'Data by Period').should('not.be.disabled').click()
    cy.contains('Data Aggregated by Period').should('be.visible')

    // Go back to Transactions Table
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
  })

  it('should persist data to localStorage and restore on reload', () => {
    cy.visit('/')
    // Modify CSV
    cy.get('textarea').clear().type('2025-01-01;"Test Transaction";"Account";"Category";-100,00 PLN;;')
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    
    // Navigate to Transactions Table view
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
    
    // Exclude a transaction (first checkbox in table)
    cy.get('table tbody tr').first().within(() => {
      cy.get('input[type="checkbox"]').first().check()
    })
    
    // Reload page
    cy.reload()
    
    // Should restore to Transactions Table view
    cy.contains('Transactions Table').should('be.visible')
    // Checkbox should still be checked
    cy.get('table tbody tr').first().within(() => {
      cy.get('input[type="checkbox"]').first().should('be.checked')
    })
  })

  it('should clear data and reset to CSV input view', () => {
    cy.visit('/')
    // Fill with example data and navigate to Data by Period view
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
    cy.contains('button', 'Data by Period').should('not.be.disabled').click()
    cy.contains('Data Aggregated by Period').should('be.visible')

    // Click clear button
    cy.contains('Clear & Start Over').click()

    // Should be back at CSV Input view with empty textarea
    cy.contains('CSV Input').should('be.visible')
    cy.get('textarea').should('be.empty')

    // Reload and verify it's still cleared
    cy.reload()
    cy.contains('CSV Input').should('be.visible')
    cy.get('textarea').should('be.empty')
  })

  it('should allow selecting all data view in Data by Period', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Data by Period').should('not.be.disabled').click()
    // Wait for the view to load - check for existence and scroll into view if needed
    cy.get('select#selection-type-select').should('exist').scrollIntoView().should('be.visible')

    // Select "All Data" view
    cy.get('select#selection-type-select').select('all')
    cy.wait(300)
    cy.contains('All Data').should('exist')
    cy.get('select#month-select').should('not.exist')
    cy.get('select#year-select').should('not.exist')
  })

  it('should allow selecting year view in Data by Period', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Data by Period').should('not.be.disabled').click()
    // Wait for the view to load - check for existence and scroll into view if needed
    cy.get('select#selection-type-select').should('exist').scrollIntoView().should('be.visible')

    // Select "By Year" view
    cy.get('select#selection-type-select').select('year')
    cy.wait(300)
    cy.get('select#year-select').should('be.visible')
    cy.contains('Year').should('exist')
    cy.get('select#month-select').should('not.exist')
  })

  it('should allow switching between view types in Data by Period', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Data by Period').should('not.be.disabled').click()
    // Wait for the view to load - check for existence and scroll into view if needed
    cy.get('select#selection-type-select').should('exist').scrollIntoView().should('be.visible')

    // Start with month view (default)
    cy.get('select#selection-type-select').should('have.value', 'month')
    cy.get('select#month-select').should('be.visible')

    // Switch to year view
    cy.get('select#selection-type-select').select('year')
    cy.wait(300)
    cy.get('select#year-select').should('be.visible')
    cy.get('select#month-select').should('not.exist')

    // Switch to all data view
    cy.get('select#selection-type-select').select('all')
    cy.wait(300)
    cy.contains('All Data').should('exist')
    cy.get('select#year-select').should('not.exist')
    cy.get('select#month-select').should('not.exist')

    // Switch back to month view
    cy.get('select#selection-type-select').select('month')
    cy.wait(300)
    cy.get('select#month-select').should('be.visible')
  })

  it('should show date and category as text when override is unchecked', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')

    // First row should have unchecked override checkbox
    cy.get('table tbody tr').first().within(() => {
      // Override checkbox should exist and be unchecked (second checkbox, first is exclude)
      cy.get('input[type="checkbox"]').eq(1).should('not.be.checked')
      // Date should be displayed as text (span), not input
      cy.get('td').eq(2).find('span').should('contain', '2025-12-12')
      cy.get('td').eq(2).find('input').should('not.exist')
      // Category should be displayed as text (span), not select
      cy.get('td').eq(4).find('span').should('exist')
      cy.get('td').eq(4).find('select').should('not.exist')
    })
  })

  it('should show date and category as editable controls when override is checked', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')

    // Check the override checkbox for the first transaction
    cy.get('table tbody tr').first().within(() => {
      // Check the override checkbox (second checkbox, first is exclude)
      cy.get('input[type="checkbox"]').eq(1).check()
      // Date should now be an input field
      cy.get('td').eq(2).find('input[type="text"]').should('exist')
      cy.get('td').eq(2).find('input[type="text"]').should('have.value', '2025-12-12')
      cy.get('td').eq(2).find('span').should('not.exist')
      // Category should now be a select dropdown
      cy.get('td').eq(4).find('select').should('exist')
      cy.get('td').eq(4).find('span').should('not.exist')
    })
  })

  it('should allow editing date when override is enabled', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')

    // Check override and edit date
    cy.get('table tbody tr').first().within(() => {
      cy.get('input[type="checkbox"]').eq(1).check()
      cy.get('td').eq(2).find('input[type="text"]').clear().type('2025-12-31')
      cy.get('td').eq(2).find('input[type="text"]').should('have.value', '2025-12-31')
    })
  })

  it('should allow changing category when override is enabled', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')

    // Check override and change category
    cy.get('table tbody tr').first().within(() => {
      cy.get('input[type="checkbox"]').eq(1).check()
      // Wait for select to be available and get first available category option
      cy.get('td').eq(4).find('select').should('exist')
      cy.get('td').eq(4).find('select option').then(($options) => {
        // Get the first non-empty option value
        const firstCategory = $options.eq(1).text() // Skip first empty option if any
        cy.get('td').eq(4).find('select').select(firstCategory)
        cy.get('td').eq(4).find('select').should('have.value', firstCategory)
      })
    })
  })

  it('should toggle between text and editable controls when override checkbox is toggled', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')

    cy.get('table tbody tr').first().within(() => {
      // Initially unchecked - should show text
      cy.get('input[type="checkbox"]').eq(1).should('not.be.checked')
      cy.get('td').eq(2).find('span').should('exist')
      cy.get('td').eq(2).find('input').should('not.exist')
      cy.get('td').eq(4).find('span').should('exist')
      cy.get('td').eq(4).find('select').should('not.exist')

      // Check override - should show editable controls
      cy.get('input[type="checkbox"]').eq(1).check()
      cy.get('td').eq(2).find('input[type="text"]').should('exist')
      cy.get('td').eq(2).find('span').should('not.exist')
      cy.get('td').eq(4).find('select').should('exist')
      cy.get('td').eq(4).find('span').should('not.exist')

      // Uncheck override - should show text again
      cy.get('input[type="checkbox"]').eq(1).uncheck()
      cy.get('td').eq(2).find('span').should('exist')
      cy.get('td').eq(2).find('input').should('not.exist')
      cy.get('td').eq(4).find('span').should('exist')
      cy.get('td').eq(4).find('select').should('not.exist')
    })
  })

  it('should navigate to Custom Categories view', () => {
    cy.visit('/')
    // Fill with example data and add transactions to enable navigation
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Categories').should('not.be.disabled').click()
    cy.contains('Categories').should('be.visible')
    cy.contains('Expense Categories').should('be.visible')
    cy.get('table').should('be.visible')
  })

  it('should navigate to Cumulative Bar Chart view', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    // Add transactions to enable navigation
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Cumulative Bar Chart').should('not.be.disabled').click()
    cy.contains('Cumulative Bar Chart').should('be.visible')
  })

  it('should search transactions in the table', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
    
    // Search for a specific transaction
    cy.get('input[placeholder="Search transactions..."]').type('BIEDRONKA')
    cy.wait(300)
    cy.get('table tbody tr').should('have.length.at.least', 1)
    cy.get('table tbody tr').first().should('contain', 'BIEDRONKA')
    
    // Clear search
    cy.get('input[placeholder="Search transactions..."]').clear()
    cy.wait(300)
    cy.get('table tbody tr').should('have.length.at.least', 10)
  })

  it('should filter transactions by category', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
    
    // Filter by category
    cy.contains('label', 'Category:').parent().find('select').select('Żywność i napoje')
    cy.wait(300)
    cy.get('table tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(4).should('contain', 'Żywność i napoje')
    })
    
    // Clear filter
    cy.contains('label', 'Category:').parent().find('select').select('All categories')
    cy.wait(300)
  })

  it('should filter transactions by month', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
    
    // Filter by month
    cy.contains('label', 'Month:').parent().find('select').then(($select) => {
      const selectElement = $select[0] as { options?: Array<{ text?: string }> }
      if (selectElement.options) {
        const options = Array.from(selectElement.options).map((opt: { text?: string }) => opt.text || '')
        if (options.length > 1) {
          cy.wrap($select).select(1) // Select first available month
          cy.wait(300)
          cy.get('table tbody tr').should('have.length.at.least', 1)
        }
      }
    })
    
    // Clear filter
    cy.contains('label', 'Month:').parent().find('select').select('All months')
    cy.wait(300)
  })

  it('should filter transactions by amount', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
    
    // Filter by amount less than
    cy.contains('label', 'Amount:').parent().find('select').select('Less than')
    cy.contains('label', 'Amount:').parent().find('input[type="number"]').type('100')
    cy.contains('label', 'Amount:').parent().find('button').contains('Apply').click()
    cy.wait(300)
    cy.get('table tbody tr').should('have.length.at.least', 1)
    
    // Clear filter
    cy.contains('label', 'Amount:').parent().find('select').select('None')
    cy.wait(300)
  })

  it('should sort transactions by all columns', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
    
    // Sort by date
    cy.contains('th', 'Date').click()
    cy.wait(300)
    cy.get('table tbody tr').first().find('td').eq(2).invoke('text').then((firstDate) => {
      cy.get('table tbody tr').eq(1).find('td').eq(2).invoke('text').then((secondDate) => {
        expect(firstDate <= secondDate).to.equal(true)
      })
    })
    
    // Sort by description
    cy.contains('th', 'Description').click()
    cy.wait(300)
    
    // Sort by category
    cy.contains('th', 'Category').click()
    cy.wait(300)
    
    // Sort by amount
    cy.contains('th', 'Amount').click()
    cy.wait(300)
  })

  it('should remove a transaction with confirmation', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
    
    // Get initial count
    cy.get('table tbody tr').then(($rows) => {
      const initialCount = $rows.length
      
      // Click remove button on first row
      cy.get('table tbody tr').first().find('button').contains('🗑️').click()
      
      // Confirm deletion
      cy.on('window:confirm', (text) => {
        expect(text).to.include('Are you sure you want to remove')
        return true
      })
      
      cy.wait(300)
      
      // Verify count decreased
      cy.get('table tbody tr').should('have.length', initialCount - 1)
    })
  })

  it('should cancel transaction removal', () => {
    cy.visit('/')
    cy.contains('Fill with Example Data').click()
    cy.wait(500)
    cy.contains('button', 'Add transactions').click()
    cy.wait(500)
    cy.contains('button', 'Transactions Table').should('not.be.disabled').click()
    cy.contains('Transactions Table').should('be.visible')
    
    // Get initial count
    cy.get('table tbody tr').then(($rows) => {
      const initialCount = $rows.length
      
      // Click remove button on first row
      cy.get('table tbody tr').first().find('button').contains('🗑️').click()
      
      // Cancel deletion
      cy.on('window:confirm', () => false)
      
      cy.wait(300)
      
      // Verify count unchanged
      cy.get('table tbody tr').should('have.length', initialCount)
    })
  })
})
