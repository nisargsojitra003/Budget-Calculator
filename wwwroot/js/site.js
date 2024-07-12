function generateTable() {
    const fromDate = new Date($('#fromDate').val());
    const toDate = new Date($('#toDate').val());

    if (isNaN(fromDate) || isNaN(toDate) || fromDate > toDate || fromDate.getTime() === toDate.getTime()) {
        alert('Please select a valid date range.');
        return;
    }

    const tableContainer = $('#tableContainer');
    tableContainer.empty();

    const table = $('<table>').addClass('table table-bordered');
    const thead = $('<thead>').addClass('thead-light');
    const tbody = $('<tbody>');

    const headerRow = $('<tr>');
    headerRow.append($('<th>').text('Category'));

    let currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
        headerRow.append($('<th>').text(currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    thead.append(headerRow);
    table.append(thead);

    const categories = [
        { name: 'Income', items: ['Income', 'Sales', 'Total Income'] },
        { name: 'Expenses', items: ['Management Fees', 'Cloud Hosting', 'Total Expenses'] },
        { name: 'Total', items: ['Profit-Loss', 'Opening Balance', 'Closing Balance'] },
    ];

    categories.forEach(category => {
        const categoryRow = $('<tr>').append($('<td>').addClass('font-weight-bold').attr('colspan', headerRow.children().length).text(category.name));
        tbody.append(categoryRow);

        category.items.forEach(item => {
            const itemRow = $('<tr>').append($('<td>').text(item));
            currentDate = new Date(fromDate);

            while (currentDate <= toDate) {
                const itemCell = $('<td>');
                const inputField = $('<input>').attr({
                    type: 'number',
                    class: 'form-control ' + category.name.replace(/\s+/g, ''),
                    value: '0'
                });

                // Assign IDs to Total Income, Total Expenses, and Profit-Loss fields
                if (item === 'Total Income') {
                    inputField.attr('id', 'totalIncome');
                } else if (item === 'Total Expenses') {
                    inputField.attr('id', 'totalExpenses');
                } else if (item === 'Profit-Loss') {
                    inputField.attr('id', 'profitLoss');
                }

                itemCell.append(inputField);
                itemRow.append(itemCell);
                currentDate.setMonth(currentDate.getMonth() + 1);
            }

            tbody.append(itemRow);
        });
    });

    table.append(tbody);
    tableContainer.append(table);

    // Calculate totals on input change
    $('input[type="number"]').on('input', function () {
        calculateTotals();
    });

    // Initial calculation
    calculateTotals();
}



function calculateTotals() {
    let totalIncome = 0;
    let totalExpenses = 0;

    // Calculate Total Income
    $('.Income input[type="number"]').each(function () {
        const value = parseFloat($(this).val()) || 0;
        console.log('Income value:', value);
        totalIncome += value;
    });

    // Set Total Income field
    $('#totalIncome').val(totalIncome);

    // Calculate Total Expenses
    $('.Expenses input[type="number"]').each(function () {
        const value = parseFloat($(this).val()) || 0;
        console.log('Expense value:', value); // Corrected typo: "Expanse" to "Expense"
        totalExpenses += value;
    });

    // Set Total Expenses field
    $('#totalExpenses').val(totalExpenses);

    // Calculate and set Profit / Loss
    const profitLoss = totalIncome - totalExpenses;
    $('#profitLoss').val(profitLoss);
}
// Event listener for input fields
$(document).ready(function () {
    // Initial calculation
    calculateTotals();
});