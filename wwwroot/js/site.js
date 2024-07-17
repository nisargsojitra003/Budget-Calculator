//Predefined Category for income and expense.
var categories = [
    { name: 'Income', type: 'income' },
    { name: 'Store', type: 'income' },
    { name: 'Expense', type: 'expense' },
    { name: 'Fees', type: 'expense' }
];

//generate table after selecting from date and to date.
function generateTable() {
    var fromDate = $('#fromDate').val();
    var toDate = $('#toDate').val();

    if (!fromDate || !toDate) {
        window.alert("Please select valid date range.");
    }

    var from = new Date(fromDate);
    var to = new Date(toDate);
    var months = [];
    var month = new Date(from);

    while (month <= to) {
        months.push(new Date(month));
        month.setMonth(month.getMonth() + 1);
    }

    var tableHTML = '<table id="mainTable" class="table table-hover mt-3"><thead><tr><th>Category</th>';

    //set selected month name in column
    months.forEach(function (month) {
        var monthName = month.toLocaleString('default', { month: 'short', year: 'numeric' });
        tableHTML += '<th>' + monthName + '</th>';
    });

    tableHTML += '</tr></thead><tbody>';

    tableHTML += '<tr><td colspan="' + month.length + 2 + '">Income</td></tr>'
    addNewCategoryRow('income');

    //add all categories value and also add delete button.
    categories.filter(c => c.type === 'income').forEach(function (category) {
        tableHTML += '<tr><td>' + category.name + '</td>';
        months.forEach(function (month) {
            tableHTML += '<td><input type="number" class="td form-control ' + category.type + '" data-category="' + category.type + '" data-name="' + category.name + '" data-month="' + month.getMonth() + '" data-year="' + month.getFullYear() + '" value="0"></td>';
        });
        tableHTML += '<td><button type="button" onclick="DeleteCategory(\'' + category.name + '\')" id="DeleteCategoryButton" class="btn btn-outline-danger">Delete</button></td>';
        tableHTML += '</tr>';
        addNewCategoryRow('income');
    });

    tableHTML += '<tr><td colspan="' + month.length + 2 + '">Expense</td></tr>'
    addNewCategoryRow('expense');


    categories.filter(c => c.type === 'expense').forEach(function (category) {
        tableHTML += '<tr><td>' + category.name + '</td>';
        months.forEach(function (month) {
            tableHTML += '<td><input type="number" class="td form-control ' + category.type + '" data-category="' + category.type + '" data-name="' + category.name + '" data-month="' + month.getMonth() + '" data-year="' + month.getFullYear() + '" value="0"></td>';
        });
        tableHTML += '<td><button type="button" onclick="DeleteCategory(\'' + category.name + '\')" id="DeleteCategoryButton" class="btn btn-outline-danger">Delete</button></td>';
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody><tfoot>';

    //add total income 
    tableHTML += '<tr><td>Total Income</td>';
    months.forEach(function () {
        tableHTML += '<td><span class="total-income">0</span></td>';
    });
    tableHTML += '</tr>';

    //add totap expense
    tableHTML += '<tr><td>Total Expense</td>';
    months.forEach(function () {
        tableHTML += '<td><span class="total-expense">0</span></td>';
    });
    tableHTML += '</tr>';

    //profit and loss
    tableHTML += '<tr><td>Profit/Loss</td>';
    months.forEach(function () {
        tableHTML += '<td><span class="profit-loss">0</span></td>';
    });
    tableHTML += '</tr>';

    //opening balance
    tableHTML += '<tr><td>Opening Balance</td>';
    months.forEach(function () {
        tableHTML += '<td><span class="opening-balance">0</span></td>';
    });

    //closing balance
    tableHTML += '<tr><td>Closing Balance</td>';
    months.forEach(function () {
        tableHTML += '<td><span class="closing-balance">0</span></td>';
    });

    tableHTML += '</tr>';
    tableHTML += '</tfoot></table>';

    $('#tableContainer').html(tableHTML);

    //add income category function.
    addNewCategoryRow('income');
    //add expense category function.
    addNewCategoryRow('expense');

    calculateTotals();
}

//add a new category function
function addNewCategoryRow(categoryType) {
    var table = $('#tableContainer table tbody');
    var placeholder = categoryType === 'income' ? 'Enter income category name' : 'Enter expense category name';
    var typeId = categoryType === 'income' ? 'newCategoryName' : 'newExpenseName';
    var newRowHTML = '<tr><td colspan="' + monthsCount + '"><input type="text" id="' + typeId + '" placeholder="' + placeholder + '"></td>';
    var monthsCount = $('#tableContainer thead th').length - 1;

    for (var i = 0; i < monthsCount; i++) {
        newRowHTML += '<td></td>';
    }

    var buttonId = categoryType === 'income' ? 'addCategoryButton' : 'addCategoryExpenseButton';
    newRowHTML += '<td><button type="button" class="btn btn-success" id="' + buttonId + '">Add Category</button></td></tr>';
    table.append(newRowHTML);

    $('#' + buttonId).on('click', function () {
        var categoryName = categoryType === 'income' ? $('#newCategoryName').val().trim() : $('#newExpenseName').val().trim();
        var ifCategoryIsAlreadyExist = categories.some(({ name, type }) => name.toLocaleLowerCase() === categoryName.toLocaleLowerCase() && type === categoryType);

        if (categoryName !== "" && !ifCategoryIsAlreadyExist) {
            categories.push({ name: categoryName, type: categoryType });
            generateTable();
        }
        else {
            alert("Please enter a valid category name or Category is already exist.");
        }
    });
}

//delete any category by name.
function DeleteCategory(categoryName) {
    if (categoryName !== null) {
        categories = categories.filter(function (obj) {
            return obj.name !== categoryName;
        });

        generateTable();
    }
    else {
        window.alert("Something went wrong!");
    }
}

//Calculate total income, total expense and profit/loss
function calculateTotals() {
    var monthsCount = $('#tableContainer thead th').length - 1;
    var totalIncome = new Array(monthsCount).fill(0);
    var totalExpense = new Array(monthsCount).fill(0);
    var openingBalance = 0;

    $('.income').each(function () {
        var index = $(this).closest('td').index() - 1;
        totalIncome[index] += parseFloat($(this).val()) || 0;
    });

    $('.expense').each(function () {
        var index = $(this).closest('td').index() - 1;
        totalExpense[index] += parseFloat($(this).val()) || 0;
    });

    for (var i = 0; i < monthsCount; i++) {
        $('.total-income').eq(i).text(totalIncome[i].toFixed(2));
        $('.total-expense').eq(i).text(totalExpense[i].toFixed(2));

        var profitLoss = totalIncome[i] - totalExpense[i];

        $('.profit-loss').eq(i).text(profitLoss.toFixed(2));

        var closingBalance = openingBalance + profitLoss;
        $('.opening-balance').eq(i).text(openingBalance.toFixed(2));
        $('.closing-balance').eq(i).text(closingBalance.toFixed(2));
        openingBalance = closingBalance;
    }

    var grandTotalIncome = totalIncome.reduce(function (a, b) { return a + b; }, 0);
    var grandTotalExpense = totalExpense.reduce(function (a, b) { return a + b; }, 0);

    var grandProfitLoss = grandTotalIncome - grandTotalExpense;

    $('.grand-total-income').text(grandTotalIncome.toFixed(2));
    $('.grand-total-expense').text(grandTotalExpense.toFixed(2));
    $('.grand-profit-loss').text(grandProfitLoss.toFixed(2));
}

$(document).on('input', 'input[type="number"]', function () {
    calculateTotals();
});

//Export table function.
function ExportTable() {
    var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
    var j = 0;
    var tab = document.getElementById('mainTable');

    if (!tab || !tab.rows) {
        window.alert('Table not found or has no rows.');
        return;
    }

    for (j = 0; j < tab.rows.length; j++) {
        tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
    }

    tab_text = tab_text + "</table>";
    tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");
    tab_text = tab_text.replace(/<img[^>]*>/gi, "");
    tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, "");

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    // If Internet Explorer or Edge
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./) || !!navigator.userAgent.match(/Edge\/\d+/)) {
        var txtArea1 = document.createElement('iframe');
        txtArea1.style.display = 'none';
        document.body.appendChild(txtArea1);
        var doc = txtArea1.contentDocument || txtArea1.contentWindow.document;
        doc.open("txt/html", "replace");
        doc.write(tab_text);
        doc.close();
        doc.execCommand("SaveAs", true, "Budget.xls");
        document.body.removeChild(txtArea1);
    } else {
        var blob = new Blob([tab_text], { type: "application/vnd.ms-excel" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'Budget.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return true;
}