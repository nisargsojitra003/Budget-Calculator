
var categories = [];

var activities = [];

$("#generateBtn").click(toggleTable);
$("#showActivity").click(ShowActivity);
$(document).on('click', '#closeActivityButton', CloseActivity);


var monthNumber = undefined;
var months = undefined;
var tableHTML = undefined;

//generate table after selecting from date and to date.

function toggleTable() {
    $('#generateBtn').hasClass('generateTable') ? generateTable() : resetTable();
}

function toggleActivityList() {
    $('#showActivity').hasClass('fullActivityList') ? ShowActivity() : CloseActivity();
}

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

    $('#fromDate').prop('disabled', true);

    $('#toDate').prop('disabled', true);

    $('#generateBtn').removeClass('generateTable').addClass('resetTable').html('Reset');

    $('#showActivity').css('display', 'block');

    $('#exportBtn').css('display', 'block');


    var from = new Date(fromDate);
    var to = new Date(toDate);
    months = [];
    var month = new Date(from);

    while (month <= to) {
        months.push(new Date(month));
        month.setMonth(month.getMonth() + 1);
    }

    tableHTML = '<table id="mainTable" class="table table-bordered mt-3"><thead><tr><th>Category</th>';

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

    $('#tableContainer').html('<div id="tableWrapper" class="custom-scrollbar" style="height: 300px; overflow-y: auto;">' + tableHTML + '</div>');

    var timestamp = CurrentDateTime();
    var converttedFromDate = convertDateFormat(fromDate);
    var converttedToDate = convertDateFormat(toDate);
    var firstActivity = `${timestamp} | Budget has been generated : From Date = ${converttedFromDate} , To Date = ${converttedToDate}.`;

    activities.push(firstActivity);
    $('#newCategoryName, #newExpenseName').on('keydown', function (o) {
        if (o.keyCode === 9) {
            var categoryName = $(this).val().trim();
            if (categoryName !== "") {
                o.preventDefault();
                var categoryType = this.id === 'newCategoryName' ? 'income' : 'expense';
                addCategory('#' + this.id, categoryType);
            }
        }
    });

    var timeStamp = undefined;
    var category = undefined;
    var value = undefined;
    var categoryType = undefined;
    var monthName = undefined;
    var year = undefined;
    var applyAllMsg = undefined;

    $(document).on('mouseover', 'input[type=number]', function () {
        category = $(this).data('name');
        value = $(this).val();
        timeStamp = CurrentDateTime();
        categoryType = $(this).data('category');
        monthName = getMonthName($(this).data('month'));
        year = $(this).data('year');
        applyAllMsg = `${timeStamp} | ${value} Rs. as ${categoryType} has been saved for ${monthName} ${year} as ${category} and applied to all.`;
        console.log(applyAllMsg);
    });

    $(".custom-menu li").click(function () {
        var action = $(this).attr("data-action");

        if (action === "first") {
            $('input[data-name="' + category + '"]').val(value).trigger('input');
        }

        if (value !== "0") {
            activities.push(applyAllMsg);
        }

        calculateTotals();

        category = undefined;
        value = undefined;
        timeStamp = undefined;
        categoryType = undefined;
        monthName = undefined;
        year = undefined;
        applyAllMsg = undefined;

        $(".custom-menu").hide(100);
    });

    calculateTotals();
}

function addCategory(categoryNameText, categoryType) {

    var categoryName = $(categoryNameText).val().trim();
    var ifCategoryIsAlreadyExist = categories.some(({ name, type }) => name.toLocaleLowerCase() === categoryName.toLocaleLowerCase() && type === categoryType);
    var timestamp = CurrentDateTime();
    var addActivity = `${timestamp} | ${categoryType} category has been added: ${categoryName}.`;

    if (categoryName !== "" && !ifCategoryIsAlreadyExist) {
        categories.push({ name: categoryName, type: categoryType });
        activities.push(addActivity);
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
        tableHTML += '<td><button type="button" id="DeleteCategoryButton" class="btn btn-danger btn-sm delete-category-button" data-category="' + category.name + '" data-type="' + categoryType + '">Delete</button></td>';

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

function convertDateFormat(date) {
    var parts = date.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function appendCategoryRow(categoryName, categoryType) {
    var months = $('#mainTable thead th').not(':first').map(function () {
        return $(this).text();
    }).get();

    var arrLength = categories.filter(c => c.type === categoryType).length;

    var newRowHTML = '<tr><td>' + categoryName + '</td>';
    months.forEach(function (month) {
        newRowHTML += '<td><input type="number" id="inptype" pattern="/^-?\d+\.?\d*$/" onKeyPress="if(this.value.length==8) return false;"  min="0" class="td form-control ' + categoryType + '" data-category="' + categoryType + '" data-name="' + categoryName + '" data-month="' + new Date(month).getMonth() + '" data-year="' + new Date(month).getFullYear() + '" value="0" maxlength="8" oninput="validateInput(this)"></td>';
    });
    newRowHTML += '<td><button type="button" class="btn btn-outline-danger delete-category-button" data-category="' + categoryName + '" data-type="' + categoryType + '">Delete</button></td>';
    newRowHTML += '</tr>';

    var typeRowIndex = $('#mainTable tbody tr').filter(function () {
        return $(this).find('td').length === 1 && $(this).find('td').text().toLowerCase().includes(categoryType);
    }).index();

    if (typeRowIndex !== -1) {
        $('#mainTable tbody tr').eq(typeRowIndex + arrLength).before(newRowHTML);
    } else {
        $("table tbody").append(newRowHTML);
    }

    var newRow = $('#mainTable tbody tr').filter(function () {
        return $(this).find('td').first().text().trim() === categoryName;
    });

    var firstInput = newRow.find('input[type=number]').first();
    firstInput.focus();
    var inputElement = firstInput[0];
    var length = inputElement.value.length;
    inputElement.type = 'text';
    inputElement.setSelectionRange(length, length);
    inputElement.type = 'number';

    $('#newCategoryName').val('');
    $('#newExpenseName').val('');

    toastr.success(`${categoryName} is added in ${categoryType} category successfully!`);
}

$(document).on('click', '.delete-category-button', delCategory);

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

function delCategory() {
    var CategoryName = $(this).data('category');
    var categoryType = $(this).data('type');
    var timeStamp = CurrentDateTime();

    var deleteConfirmation = confirm(`Are you sure, you want to delete the category "${CategoryName}" ?`);
    if (deleteConfirmation) {
        categories = categories.filter(function (obj) {
            return obj.name !== CategoryName;
        });
        activities.push(`${timeStamp} | ${categoryType} category has been deleted: ${CategoryName}`);
        $(this).closest('tr').remove();
        calculateTotals();
        toastr.error(`${CategoryName} is deleted successfully!`)
    }
}

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

$(document).on('focusout', 'input[type="number"]', function () {
    var timestamp = CurrentDateTime();
    var inputValue = $(this).val();
    var categoryType = $(this).data('category');
    var monthName = getMonthName($(this).data('month'));
    var year = $(this).data('year');
    var categoryName = $(this).data('name');

    var addValueActivity = `${timestamp} | ${inputValue} Rs. as ${categoryType} has been saved for ${monthName} ${year} as ${categoryName}.`;

    if (inputValue !== "0") {
        activities.push(addValueActivity);

    }

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
    var excelSheetName = ExcelSheetName();
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
        doc.execCommand("SaveAs", true, excelSheetName);
        document.body.removeChild(txtArea1);
        toastr.success('File generated successfully!');
    } else {
        var blob = new Blob([tab_text], { type: "application/vnd.ms-excel" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = excelSheetName;
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

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

function getMonthName(monthNumber) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[monthNumber];
}

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

function CollectData() {
    var data = [];

    var tab = $('#mainTable');

    //if (!tab || !tab.rows) {
    //    toastr.error('Table not found or has no rows.');
    //    return;
    //}
    $('#mainTable tbody tr').each(function () {
        var category = $(this).find('td:first').text().trim();

        if (category && category.toLowerCase() !== 'income' && category.toLowerCase() !== 'expense') {
            $(this).find('input[type="number"]').each(function () {
                var monthIndex = $(this).data('month');
                var year = $(this).data('year');
                var amount = parseFloat($(this).val()) || 0;

                var monthName = new Date(year, monthIndex).toLocaleString('default', { month: 'long' });

                data.push({
                    Category: category,
                    Month: monthName,
                    Year: year,
                    Amount: amount
                });
            });
        }
    });

    return data;
}

function formatDate(date) {
    var d = new Date(date);
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    return `${day}${month}${year}`;
}

function CurrentDateTime() {
    var now = new Date();
    var day = String(now.getDate()).padStart(2, '0');
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var year = now.getFullYear();
    var hours = String(now.getHours()).padStart(2, '0');
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = String(hours).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}${month}${year}_T${hours}${minutes}${ampm}`;
}

function ExcelSheetName() {

    var fromDate = $("#fromDate").val();
    var toDate = $("#toDate").val();
    var formattedFromDate = formatDate(fromDate);
    var formattedToDate = formatDate(toDate);

    var currentDateTime = CurrentDateTime();

    var sheetName = `Budget_${formattedFromDate}_${formattedToDate}_${currentDateTime}`;

    return sheetName;
}

function resetTable() {

    var confirmationOfReset = confirm("Are you sure you want to reset this page? Once confirmed, you will not be able to undo this action.")

    if (confirmationOfReset) {
        var fromDatePicker = $("#fromDate");
        var toDatePicker = $("#toDate");
        $('#showActivity').show();

        fromDatePicker.val('');
        toDatePicker.val('');
        fromDatePicker.prop('disabled', false);
        toDatePicker.prop('disabled', false);
        $('#showActivity').css('display', 'none');
        $('#exportBtn').css('display', 'none');

        months = [];
        categories = [];
        activities = [];
        window.location.reload();
    }
}

function ShowActivity() {

    activities.sort(function (a, b) {
        if (a > b) return -1;
        if (a < b) return 1;
        return 0;
    });

    var activityListHTML = `
        <div style='height: 250px; width: 1300px; overflow-y: auto; overflow-x: auto; border: 1px solid #ccc;' class='activity-box custom-scrollbar mt-1 p-1 bg-light rounded'>
            <div class='d-flex justify-content-between align-items-center mb-4'>
                <h4 class='text-primary mb-0'>Activity List</h4>
                <button data-toggle="tooltip" data-placement="top" title="Close" type='button' id='closeActivityButton' class='btn btn-danger btn-close'></button>
            </div>
    `;

    $('#showActivity').hide();

    activities.forEach(function (activity, index) {
        activityListHTML += `
            <div class='card mb-3 shadow-lg'>
                <div class='card-body'>
                    <p class='card-text'>${activity}</p>
                </div>
            </div>
        `;
    });

    $("#mainTable").find("input,button,textarea,select").attr("disabled", "disabled");

    activityListHTML += "</div>";

    $("#activityList").html(activityListHTML);
}


function CloseActivity() {
    //$('#showActivity').removeClass('closeActivityList').addClass('fullActivityList').html('Activity');

    $('#showActivity').show();

    $("#mainTable").find("input,button,textarea,select").removeAttr("disabled");

    $('#activityList').empty();
}