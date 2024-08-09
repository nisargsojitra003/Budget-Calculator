//Budget Calculator 
var categories = [];

var activities = [];

$(document).on('click', '#generateBtn', toggleTable);
$(document).on('click', '#showActivity', ShowActivity);
$(document).on('click', '#closeActivityButton', CloseActivity);
$(document).on('click', '.delete-category-button', delCategory);

var monthNumber = undefined;
var months = undefined;
var tableHTML = undefined;

let timeOfToast = true;
var isExportIsLastAction = false;

$(document).on("click", "#tableContainer", function () {
    if (timeOfToast) {
        ReadOnlyMode();
        timeOfToast = false;
        setTimeout(function () {
            timeOfToast = true;
        }, 10000);
    }
});

function ReadOnlyMode() {
    if ($('#activityList').hasClass('activityCheck')) {
        toastr.error("Calculator is in read-only mode, Close the activity list to edit.");
    }
}

function toggleTable() {
    $('#generateBtn').hasClass('generateTable') ? generateTable() : resetTable();
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

    tableHTML = '<table id="mainTable" class="table table-bordered mt-2 shadow-lg p-3 bg-white rounded"><thead><tr><th>Category</th>';

    months.forEach(function (month) {
        var monthName = month.toLocaleString('default', { month: 'short', year: 'numeric' });
        tableHTML += '<th style="text-align: center !important">' + monthName + '</th>';
    });

    tableHTML += '</tr></thead><tbody><div>';

    var colSpan = parseFloat(months.length) + 2;

    tableHTML += '<tr><td class="staticRow" colspan="' + colSpan + '"><span>Income</span></td></tr>'

    monthNumber = months.length + 1;

    AddFilterCategory('income');

    tableHTML += addNewCategoryRow('income');

    tableHTML += '<tr><td class="staticRow" colspan="' + colSpan + '"><span>Expense</span></td></tr>'

    AddFilterCategory('expense')

    tableHTML += addNewCategoryRow('expense');

    //tableHTML += '</tbody><tfoot>';

    CommonTrTd('Total Income', 'total-income');

    CommonTrTd('Total Expense', 'total-expense');

    CommonTrTd('Profit/Loss', 'profit-loss');

    CommonTrTd('Opening Balance', 'opening-balance');

    CommonTrTd('Closing Balance', 'closing-balance');

    tableHTML += '</tr>';
    tableHTML += '</div></tbody></table>';

    $('#tableContainer').html('<div id="tableWrapper" class="custom-scrollbar table-container" style="height: 670px; overflow-y: auto; margin: 0 -150px;">' + tableHTML + '</div>');

    activities.push(`${CurrentDateTimeInFormat()} | Budget has been generated : From Date = ${convertDateFormat(fromDate)} , To Date = ${convertDateFormat(toDate)}.`);
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
        timeStamp = CurrentDateTimeInFormat();
        isExportIsLastAction = false;
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
    var addActivity = `${CurrentDateTimeInFormat()} | ${categoryType} category has been added: ${categoryName}.`;

    if (categoryName !== "" && !ifCategoryIsAlreadyExist) {
        categories.push({ name: categoryName, type: categoryType });
        activities.push(addActivity);
        appendCategoryRow(categoryName, categoryType);
        isExportIsLastAction = false;
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
        tableHTML += '<td><span class="' + title + ' totalRows">0</span></td>';
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

function addNewCategoryRow(categoryType) {
    var table = $('#tableContainer table tbody');
    var placeholder = categoryType === 'income' ? 'Add new income category' : 'Add new expense category';
    var typeId = categoryType === 'income' ? 'newCategoryName' : 'newExpenseName';
    var newRowHTML = '<tr><td class="addCategorytd" colspan="' + (monthNumber + 1) + '" ><input type="text" id="' + typeId + '" placeholder="' + placeholder + '" onkeypress="return isNotNumber(event)" ></td></tr>';

    table.append(newRowHTML);

    return newRowHTML;

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

    var timestamp = CurrentDateTimeInFormat();
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
    var tab = document.getElementById('mainTable');

    if (!tab || !tab.rows) {
        toastr.error('Table not found or has no rows.');
        return;
    }

    isExportIsLastAction = true;

    var data = [];
    for (var j = 0; j < tab.rows.length; j++) {
        var row = [];
        for (var k = 0; k < tab.rows[j].cells.length; k++) {
            var cell = tab.rows[j].cells[k];
            var cellHtml = cell.innerHTML;

            cellHtml = cellHtml.replace(/<span[^>]*>|<\/span>/g, "");
            cellHtml = cellHtml.replace(/<button[^>]*>|<\/button>/g, "");
            cellHtml = cellHtml.replace(/<strong[^>]*>|<\/strong>/g, "");

            var inputs = cell.getElementsByTagName('input');
            if (inputs.length > 0) {
                cellHtml = inputs[0].value;
            }

            row.push(cellHtml.replace(/Delete/gi, ''));
        }
        data.push(row);
    }

    var wb = XLSX.utils.book_new();

    var ws1 = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws1, "Main Table");

    var activitiesData = [];

    activitiesData.push(['Activity:']);

    activities.forEach(function (activity) {
        activitiesData.push([activity]);
    });

    var ws2 = XLSX.utils.aoa_to_sheet(activitiesData);
    XLSX.utils.book_append_sheet(wb, ws2, "Activity List");

    var excelSheetName = ExcelSheetName();
    XLSX.writeFile(wb, excelSheetName + ".xlsx");

    toastr.success('File generated successfully!');
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

function isNotNumber(evt) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode == 8 || charCode == 46 || charCode == 9 || charCode == 27 || charCode == 13) {
        return true;
    }

    if (charCode >= 48 && charCode <= 57) {
        return false;
    }
    return true;
}

$(document).on("mousedown", function (e) {
    if (!$(e.target).closest(".custom-menu").length) {
        $(".custom-menu").hide(100);
    }
});

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

function CurrentDateTimeInFormat() {
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
    return `${day}-${month}-${year}_T${hours}:${minutes} ${ampm}`;
}

function ExcelSheetName() {
    var fromDate = $("#fromDate").val();
    var toDate = $("#toDate").val();
    var sheetName = `Budget_${formatDate(fromDate)}_${formatDate(toDate)}_${CurrentDateTime()}`;

    return sheetName;
}


function handleSweetAlert(actionType, additionalData) {
    let swalOptions = {
        icon: 'warning',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        customClass: 'swal-alert',
        position: 'top'
    };

    switch (actionType) {
        case 'deleteCategory':
            const { CategoryName, categoryType, timeStamp } = additionalData;
            swalOptions.text = `Are you sure you want to delete "${CategoryName}" category?`;
            swalOptions.confirmButtonText = 'Delete';
            break;

        case 'resetTable':
            swalOptions.text = `On "Confirm", Calculator will be reset and you will loose the entered data. Please export the data before reset!`;
            swalOptions.icon = 'question';
            swalOptions.confirmButtonText = 'Confirm';
            break;
    }

    Swal.fire(swalOptions).then((result) => {
        if (result.isConfirmed) {
            switch (actionType) {
                case 'deleteCategory':
                    const { CategoryName, categoryType, timeStamp, context } = additionalData;
                    categories = categories.filter(function (obj) {
                        return obj.name !== CategoryName;
                    });
                    activities.push(`${timeStamp} | ${categoryType} category has been deleted: ${CategoryName}`);
                    $(context).closest('tr').remove();
                    isExportIsLastAction = false;
                    calculateTotals();
                    toastr.error(`${CategoryName} category is deleted successfully`);
                    break;

                case 'resetTable':
                    $('#fromDate').val('').prop('disabled', false);
                    $('#toDate').val('').prop('disabled', false);
                    $('#showActivity').hide();
                    $('#exportBtn').hide();
                    $('#tableWrapper').empty();
                    $('#activityList').empty();
                    $('#generateBtn').removeClass('resetTable').addClass('generateTable').html('Generate');

                    months = [];
                    categories = [];
                    activities = [];
                    break;
            }
        }
    });
}

function delCategory() {
    var CategoryName = $(this).data('category');
    var categoryType = $(this).data('type');
    var timeStamp = CurrentDateTimeInFormat();

    handleSweetAlert('deleteCategory', {
        CategoryName: CategoryName,
        categoryType: categoryType,
        timeStamp: timeStamp,
        context: this
    });
}

function resetTable() {
    if (!isExportIsLastAction) {
        handleSweetAlert('resetTable');
    }
    else {
        $('#fromDate').val('').prop('disabled', false);
        $('#toDate').val('').prop('disabled', false);
        $('#showActivity').hide();
        $('#exportBtn').hide();
        $('#tableWrapper').empty();
        $('#activityList').empty();
        $('#generateBtn').removeClass('resetTable').addClass('generateTable').html('Generate');

        months = [];
        categories = [];
        activities = [];
    }
}

function ShowActivity() {

    activities = activities.reverse();

    $('#tableWrapper').css("height", "335px");

    $('#activityList').addClass('activityCheck');

    var activityListHTML = `
        <div class='activity-box custom-scrollbar bg-light rounded shadow-lg' style='height: 335px; margin: 0 -150px; width: 1600px; overflow-y: auto; overflow-x: auto; border: 1px solid #ccc; background-color: #f4fcff !important;'>
            <div class='d-flex activityListHeader justify-content-between text-center align-items-center ms-3'>
                <h4 class='text-info activityTitle  mb-0'><strong>Activity List</strong></h4>
                <button data-toggle="tooltip" data-placement="top" title="Close" type='button' id='closeActivityButton' class='btn btn-outline-danger p-1 me-1'>
                    <i class="bi bi-x"></i>
                </button>
            </div>
    `;

    $('#showActivity').hide();

    activities.forEach(function (activity, index) {
        let cardClass = (index % 2 === 0) ? 'even-card' : 'odd-card';
        activityListHTML += `
    <div class='card mb-2 shadow-sm rounded-3 mx-3 card-hover ${cardClass}'>
        <div class='card-body p-2'>
            <p class='card-text activityP' style='font-size: 0.9rem;'>${activity}</p>
        </div>
    </div>
    `;
    });

    $("#mainTable").find("input, button, textarea, select").attr("disabled", "disabled");

    activityListHTML += "</div>";

    $("#activityList").html(activityListHTML);

    activities = activities.reverse();
}

function CloseActivity() {
    $('#tableWrapper').css("height", "670px");

    $('#activityList').removeClass('activityCheck');

    $('#showActivity').show();

    $("#mainTable").find("input,button,textarea,select").removeAttr("disabled");

    $('#activityList').empty();
}

window.onbeforeunload = function () {
    return "are you sure you want to reset this page? once confirmed, you will not be able to undo this action.";
};