//Predefined Category for income and expense.
var categories = [
    //{ name: 'income', type: 'income' },
    //{ name: 'fees', type: 'expense' },
];
var monthNumber = undefined;
var months = undefined;
var tableHTML = undefined;
//generate table after selecting from date and to date.
function generateTable() {
    var fromDate = $('#fromDate').val();
    var toDate = $('#toDate').val();

    if (!fromDate || !toDate) {
        toastr.error('Please select both From Date and To Date.')
        return;
    }

    if (toDate <= fromDate) {
        toastr.error('To Date must be greater than From Date.')
        return;
    }

    var from = new Date(fromDate);
    var to = new Date(toDate);
    months = [];
    var month = new Date(from);

    while (month <= to) {
        months.push(new Date(month));
        month.setMonth(month.getMonth() + 1);
    }

    tableHTML = '<table id="mainTable" class="table table-hover mt-3"><thead><tr><th>Category</th>';

    //set selected month name in column
    months.forEach(function (month) {
        var monthName = month.toLocaleString('default', { month: 'short', year: 'numeric' });
        tableHTML += '<th>' + monthName + '</th>';
    });

    tableHTML += '</tr></thead><tbody>';

    tableHTML += '<tr><td colspan="' + months.length + 2 + '">Income</td></tr>'

    monthNumber = months.length + 1;

    AddFilterCategory('income');

    tableHTML += addNewCategoryRow('income');

    tableHTML += '<tr><td colspan="' + months.length + 2 + '">Expense</td></tr>'

    AddFilterCategory('expense')

    tableHTML += addNewCategoryRow('expense');

    tableHTML += '</tbody><tfoot>';

    CommonTrTd('Total Income', 'total-income');

    CommonTrTd('Total Expense', 'total-expense');

    CommonTrTd('Profit/Loss', 'profit-loss');

    CommonTrTd('Opening Balance', 'opening-balance');

    CommonTrTd('Closing Balance', 'closing-balance');

    tableHTML += '</tr>';
    tableHTML += '</tfoot></table>';

    $('#tableContainer').html(tableHTML);

    $('#newCategoryName, #newExpenseName').on('keydown', function (o) {
        if (o.keyCode === 9) {                                                  //for "tab" key code = 9
            var categoryName = $(this).val().trim();
            if (categoryName !== "") {
                o.preventDefault();
                var categoryType = this.id === 'newCategoryName' ? 'income' : 'expense';
                addCategory('#' + this.id, categoryType);
            }
        }
    });

    var category = undefined;
    var value = undefined;

    $(document).on('mouseover', 'input[type=number]', function () {         // keyup click focus mouseover
        category = $(this).data('name');
        value = $(this).val();
    });

    $(".custom-menu li").click(function () {
        var action = $(this).attr("data-action");

        if (action === "first") {
            $('input[data-name="' + category + '"]').val(value).trigger('input');
        }

        category = undefined;
        value = undefined;

        $(".custom-menu").hide(100);
    });

    calculateTotals();
}

function addCategory(categoryNameText, categoryType) {
    var categoryName = $(categoryNameText).val().trim();
    var ifCategoryIsAlreadyExist = categories.some(({ name, type }) => name.toLocaleLowerCase() === categoryName.toLocaleLowerCase() && type === categoryType);

    if (categoryName !== "" && !ifCategoryIsAlreadyExist) {
        categories.push({ name: categoryName, type: categoryType });
        appendCategoryRow(categoryName, categoryType);
    } else {
        toastr.error('Entered Category is already exist')
    }
}

function AddFilterCategory(categoryType) {
    categories.filter(c => c.type === categoryType).forEach(function (category) {
        tableHTML += '<tr class="tr"><td>' + category.name + '</td>';
        months.forEach(function (month) {
            tableHTML += '<td><input type="number" pattern="/^-?\d+\.?\d*$/" onKeyPress="if(this.value.length==8) return false;" min="0" id="inptype" class="td form-control ' + category.type + '" data-category="' + category.type + '" data-name="' + category.name + '" data-month="' + month.getMonth() + '" data-year="' + month.getFullYear() + '" value="0" maxlength = "8" oninput="validateInput(this)"></td>';
        });
        tableHTML += '<td><button type="button"  id="DeleteCategoryButton" class="btn btn-outline-danger delete-category-button" data-category="' + category.name + '">Delete</button></td>';
        tableHTML += '</tr>';
    });
}

function CommonTrTd(name, title) {
    tableHTML += '<tr><td><strong>' + name + '</strong></td>';
    months.forEach(function () {
        tableHTML += '<td><span class="' + title + '">0</span></td>';
    });
    tableHTML += '</tr>';
}

function appendCategoryRow(categoryName, categoryType) {
    var months = $('#mainTable thead th').not(':first').map(function () {
        return $(this).text();
    }).get();

    //find array length and add in row index
    var arrLength = categories.filter(c => c.type === categoryType).length;

    var newRowHTML = '<tr><td>' + categoryName + '</td>';
    months.forEach(function (month) {
        newRowHTML += '<td><input type="number" id="inptype" pattern="/^-?\d+\.?\d*$/" onKeyPress="if(this.value.length==8) return false;"  min="0" class="td form-control ' + categoryType + '" data-category="' + categoryType + '" data-name="' + categoryName + '" data-month="' + new Date(month).getMonth() + '" data-year="' + new Date(month).getFullYear() + '" value="0" maxlength="8" oninput="validateInput(this)"></td>';
    });
    newRowHTML += '<td><button type="button" class="btn btn-outline-danger delete-category-button" data-category="' + categoryName + '">Delete</button></td>';
    newRowHTML += '</tr>';

    //find static category line 
    var typeRowIndex = $('#mainTable tbody tr').filter(function () {
        return $(this).find('td').length === 1 && $(this).find('td').text().toLowerCase().includes(categoryType);
    }).index();

    if (typeRowIndex !== -1) {
        $('#mainTable tbody tr').eq(typeRowIndex + arrLength).before(newRowHTML);
    } else {
        $("table tbody").append(newRowHTML);
    }

    // Add click event to the first td of the new row
    var newRow = $('#mainTable tbody tr').filter(function () {
        return $(this).find('td').first().text().trim() === categoryName;
    });

    var firstInput = newRow.find('input[type=number]').first();
    firstInput.focus();

    $('#newCategoryName').val('');
    $('#newExpenseName').val('');

    var toastMessage = `${categoryName} is added in ${categoryType} category successfully!`;

    categoryType === 'income' ? toastr.success(toastMessage) : toastr.warning(toastMessage);
}

//onclick delete method
$(document).on('click', '.delete-category-button', delCategory);

//add a new category function
function addNewCategoryRow(categoryType) {
    var table = $('#tableContainer table tbody');
    var placeholder = categoryType === 'income' ? 'Add new income category name' : 'Add new expense category name';
    var typeId = categoryType === 'income' ? 'newCategoryName' : 'newExpenseName';
    var newRowHTML = '<tr><td colspan = "' + monthNumber + '"><input type="text" id="' + typeId + '" placeholder="' + placeholder + '"></td>';
    //var buttonId = categoryType === 'income' ? 'addCategoryButton' : 'addCategoryExpenseButton';
    //newRowHTML += '<td><button type="button" class="btn btn-success d-none" id="' + buttonId + '">Add Category</button></td></tr>';
    table.append(newRowHTML);

    return newRowHTML;
}

//delete any category by name.
function delCategory() {
    var CategoryName = $(this).data('category');
    categories = categories.filter(function (obj) {
        return obj.name !== CategoryName;
    });
    $(this).closest('tr').remove();
    calculateTotals();
    toastr.info(`${CategoryName} is deleted successfully!`)
}

//Calculate total income, total expense, profit/loss, opening and closing balance.
function calculateTotals() {
    var monthsCount = $('#tableContainer thead th').length - 1;

    var totalIncome = new Array(monthsCount).fill(0);
    var totalExpense = new Array(monthsCount).fill(0);

    var openingBalance = 0;

    $('.income').each(function () {
        var index = $(this).closest('td').index() - 1;
        totalIncome[index] += parseFloat($(this).val());
    });

    $('.expense').each(function () {
        var index = $(this).closest('td').index() - 1;
        totalExpense[index] += parseFloat($(this).val());
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

function ExportTable() {
    var tab_text = "<table><tr>";
    var tab = document.getElementById('mainTable');

    if (!tab || !tab.rows) {
        toastr.error('Table not found or has no rows.');
        return;
    }

    tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");
    tab_text = tab_text.replace(/<img[^>]*>/gi, "");
    tab_text = tab_text.replace(/<button[^>]*>|<\/button>/gi, "");

    for (var j = 0; j < tab.rows.length; j++) {
        var row = tab.rows[j];
        tab_text += "<tr>";

        for (var k = 0; k < row.cells.length; k++) {
            var cell = row.cells[k];
            var cellHtml = cell.innerHTML;

            var inputs = cell.getElementsByTagName('input');

            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                if (input.type === 'number' || input.type === 'text') {
                    cellHtml = input.value;
                }
            }

            cellHtml = cellHtml.replace(/Delete/gi, '');

            tab_text += "<td>" + cellHtml + "</td>";
        }
        tab_text += "</tr>";
    }

    tab_text += "</table>";

    var ua = window.navigator.userAgent;

    var msie = ua.indexOf("MSIE");

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
        toastr.success('File generated successfully!');
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
        toastr.success('File generated successfully!');
    }
    //toastr.success('File generated successfully!');
    return true;
}

$(document).on("contextmenu", "#inptype[type=number]", function (event) {
    event.preventDefault();

    $(".custom-menu").finish().toggle(100)
        .css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        });
});

//through click on screen we can hide option.
$(document).on("mousedown", function (e) {
    if (!$(e.target).closest(".custom-menu").length) {
        $(".custom-menu").hide(100);
    }
});

//validation for every input type number
function validateInput(input) {
    input.value = input.value.replace(/[^0-9.]/g, '');

    let parts = input.value.split('.');

    if (parts.length > 2) {
        input.value = parts[0] + '.' + parts.slice(1).join('');
    }

    if (parseFloat(input.value) > 0) {
        input.value = parseFloat(input.value).toString();
        return;
    }

    if (parseFloat(input.value) < 0 || input.value === '') {
        input.value = '0';
        return;
    }

    if (input.value === '0' && event.inputType === 'deleteContentBackward') {
        input.value = '0';
        return;
    }

    if (input.value.startsWith('0') && input.value.length > 1 && input.value[1] !== '.') {
        input.value = input.value.substring(1);
    }

    if (input.maxLength && input.value.length > input.maxLength) {
        input.value = input.value.slice(0, input.maxLength);
    }
}