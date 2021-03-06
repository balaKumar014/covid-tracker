let surveyDetailArray = "";
let sortedSurveyDetailArray = "";
let surveyDetailObject = "";
let timeEntryDetailObject = "";
let currentStateName = "";
let timeEntriesDetailArray = [];
let sortedDateArray = [];

handleSurveyDetails = async(surveyUrl, timeEntriesUrl) => {
    let surveyDetails = await getSurveyDetails(surveyUrl);
    let surveyDetailsArray = constructArray(surveyDetails);
    surveyDetailArray = surveyDetailsArray;
    $(this).addClass("active-page");
    await getTimeEntriesDetails(timeEntriesUrl);
    renderSurveyDetails(0, 10, surveyDetailsArray);
    assignPagination(surveyDetailsArray);
    renderPaginatedValues();
    searchByStateName();
    searchByDistrict(defaultHtmlElements.districtSearchBoxDetail);
    searchByDate(defaultHtmlElements.dateBoxDetail, "surveyDetail");
    sortingSurveyDetails();
    renderStateDetails();
    nextSlides();
    return;
};

getSurveyDetails = async(url) => {

    const surveyData = await getData(url);
    const surveyJsonData = await surveyData.json();
    surveyDetailObject = surveyJsonData;
    return surveyJsonData;
};

getTimeEntriesDetails = async(url) => {

    const timeEntryData = await getData(url);
    const timeEntryJsonData = await timeEntryData.json();
    timeEntryDetailObject = timeEntryJsonData;
    return timeEntryJsonData;
};

constructArray = (details) => {

    const array = [];
    for (const key in details) {
        let object = {
            [key]: details[key],
        };
        array.push(object);
    }
    return array;
};

renderSurveyDetails = (requiredIndex, requiredLength, array) => {

    $(defaultHtmlElements.renderSurveyDetails).empty();
    for (let index = requiredIndex; index < requiredLength; index++) {
        const element = array[index];
        buildSurveyDetailsPlaceholder(element);
        renderStateAndDistrictDetails(element);
        searchByDistrict(defaultHtmlElements.districtSearchBoxDetail);
        searchByDate(defaultHtmlElements.dateBoxDetail, "surveyDetail");
        renderStateDetails();
    }
    return;
};

renderPaginatedValues = () => {

    $(`${defaultHtmlElements.paginatedButtons}`).click(function() {
        $(defaultHtmlElements.paginatedButtons).removeClass("active-page");
        $(this).addClass("active-page");
        const paginationValue = $(this).attr("value") + "0";
        const requiredIndex = paginationValue - 10;
        renderSurveyDetails(requiredIndex, paginationValue, surveyDetailArray);
        nextSlides();
    });
    return;
};

searchByStateName = () => {

    $(`${defaultHtmlElements.searchBoxDetail}`).change(function() {
        let objectLength = Object.keys(surveyDetailObject).length;
        let currentValue = this.value;
        currentValue = currentValue.toUpperCase();
        for (const [index, [key, value]] of Object.entries(
                Object.entries(surveyDetailObject)
            )) {
            if (key == currentValue) {
                let object = {
                    [key]: value,
                };
                $(defaultHtmlElements.renderSurveyDetails).empty();
                $(defaultHtmlElements.renderPaginationDetails).empty();
                buildSurveyDetailsPlaceholder(object);
                renderStateAndDistrictDetails(object);
                nextSlides();
                return;
            } else {
                if (parseInt(index) + 1 == objectLength) {
                    if (!currentValue) {
                        renderSurveyDetails(0, 10, surveyDetailArray);
                        assignPagination(surveyDetailArray);
                        renderPaginatedValues();
                        return;
                    } else {
                        return renderNoData();
                    }
                }
            }
        }
    });
};

renderStateDetails = () => {

    $(defaultHtmlElements.detailPage).click(function() {
        let stateName = $(this).closest("div.state-details-container").attr("state");
        return localStorage.setItem("stateName", stateName);
    });
};

initiateDetailRender = (currentStateName) => {

    let timeEntries = timeEntryDetailObject[currentStateName].dates;
    $("#state_name").empty();
    $("#state_name").append(`<span >${currentStateName}</span>`);
    for (const key in timeEntries) {
        let prepareObject = {};
        prepareObject[key] = timeEntries[key];
        makeDetailedPageObject(prepareObject);
    }
    return;
};

searchByDistrict = (element, state) => {

    $(element).change(function() {
        if (!state) {
            let response = "";
            let stateName = $(this).closest("div.state-details-container").attr("state");
            if (this.value != "Select a District") {
                response = surveyDetailObject[stateName].districts[this.value];
            } else {
                response = surveyDetailObject[stateName];
            }
            let object = {
                [stateName]: response,
            };
            renderStateAndDistrictDetails(object);
            nextSlides();
        } else {
            let response = "";
            let stateName = state;
            if (this.value != "Select a District") {
                response = surveyDetailObject[stateName].districts[this.value];
                let object = {
                    [this.value]: response,
                };
                $("table").show();
                $(defaultHtmlElements.detailedTableBody).empty();
                $(defaultHtmlElements.detailedPageNoData).empty();
                $("table tr:eq(0) th:eq(0)").text("District");
                makeDetailedPageObject(object);
            } else {
                $("table tr:eq(0) th:eq(0)").text("Date");
                $(defaultHtmlElements.detailedTableBody).empty();
                initiateDetailRender(stateName);
            }
        }
    });
};

searchByDate = (element, type) => {

    $(element).change(function() {
        let date = dateFormat(this.value);
        if (type == "surveyDetail") {
            if (date != "-undefined-undefined") {
                for (const key in timeEntryDetailObject) {
                    let value = timeEntryDetailObject[key].dates[date];
                    let object = {
                        [key]: value ? value : {},
                    };
                    renderStateAndDistrictDetails(object);
                }
            } else {
                renderSurveyDetails(0, 10, surveyDetailArray);
                assignPagination(surveyDetailArray);
                renderPaginatedValues();
                nextSlides();
                return;
            }
        }
        if (type == "fullDetail") {
            let stateName = localStorage.getItem("stateName");
            if (date != "-undefined-undefined") {
                let value = timeEntryDetailObject[stateName].dates[date];
                let object = {
                    [date]: value ? value : {},
                };
                $("table").show();
                $(defaultHtmlElements.detailedTableBody).empty();
                $(defaultHtmlElements.detailedPageNoData).empty();
                $("table tr:eq(0) th:eq(0)").text("Date");
                makeDetailedPageObject(object);
            } else {
                $(defaultHtmlElements.detailedTableBody).empty();
                initiateDetailRender(stateName);
            }
        }
        return;
    });
};

dateFormat = (date) => {

    let formatDate = date.split("-");
    return formatDate[0] + "-" + formatDate[1] + "-" + formatDate[2];
};

generateSurvayValues = (object) => {

    let detailObject = {
        confirmed: object.confirmed ? object.confirmed : 0,
        recovered: object.recovered ? object.recovered : 0,
        deceased: object.deceased ? object.deceased : 0,
        tested: object.tested ? object.tested : 0,
        vaccinated1: object.vaccinated1 ? object.vaccinated1 : 0,
        vaccinated2: object.vaccinated2 ? object.vaccinated2 : 0,
    };
    return detailObject;
};

sortingSurveyDetails = () => {

    $(defaultHtmlElements.sortBy).click(function() {
        const sortType = $(defaultHtmlElements.sortType).val();
        const sortValue = $(defaultHtmlElements.sortValue).val();
        if (sortType !== "Select Sort Type" && sortValue !== "Select Sort Value") {
            surveyDetailArraySorting(surveyDetailArray, sortValue);
            const sortedArray = arraySortingBasedOnType(sortType, sortedSurveyDetailArray);
            renderSurveyDetails(0, 9, sortedArray);
            nextSlides();
        }
        return;
    });
};

arraySortingBasedOnType = (sortType, array) => {

    let detail = "";
    if (sortType == "Ascending") {
        detail = array;
    } else if (sortType == "Descending") {
        detail = array.reverse();
    }
    return detail;
};

surveyDetailArraySorting = (array, key) => {

    sortedSurveyDetailArray = array;
    sortedSurveyDetailArray.sort(function(a, b) {
        const firstKey = Object.keys(a).find((keys) => keys);
        const secondKey = Object.keys(b).find((keys) => keys);
        return a[firstKey].total[key] - b[secondKey].total[key];
    });
};

timeEntriesDetailArraySorting = (value) => {

    let staeName = localStorage.getItem("stateName");
    let stateTimeEntry = timeEntryDetailObject[staeName].dates;
    timeEntriesDetailArray = [];
    for (const key in stateTimeEntry) {
        let object = {
            [key]: stateTimeEntry[key],
        };
        timeEntriesDetailArray.push(object);
    }
    return sortDateArray(timeEntriesDetailArray, value);
};

timeEntriesObjectForm = (array) => {

    let staeName = localStorage.getItem("stateName");
    $(defaultHtmlElements.detailedTableBody).empty();
    $(defaultHtmlElements.detailedPageNoData).empty();
    $("table tr:eq(0) th:eq(0)").text("Date");
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        for (const key in element) {
            let timeEntryObject = timeEntryDetailObject[staeName].dates[key];
            let object = {
                [key]: timeEntryObject,
            };
            makeDetailedPageObject(object);
        };
    };
    return;
};

sortingTimeEntriesDetails = () => {

    $(defaultHtmlElements.detailSortBy).click(function() {
        const sortType = $(defaultHtmlElements.detailSortType).val();
        const sortValue = $(defaultHtmlElements.detailSortValue).val();
        if (sortType !== "Select Sort Type" && sortValue !== "Select Sort Value") {
            timeEntriesDetailArraySorting(sortValue);
            let sortedArray = arraySortingBasedOnType(sortType, sortedDateArray);
            timeEntriesObjectForm(sortedArray);
            return;
        }
    });
};

nextSlides = () => {

    $(".next").click(function() {
        let attribute = $(this).attr("state");
        let idSplit = attribute.split("-");
        let totalVisible = $(`#varient-Total-${idSplit[1]}`).is(":visible");
        let deltaVisible = $(`#varient-Delta-${idSplit[1]}`).is(":visible");
        let delta7Visible = $(`#varient-Delta7-${idSplit[1]}`).is(":visible");
        if (totalVisible) {
            $(`#varient-Delta-${idSplit[1]}`).show();
            $(`#varient-Total-${idSplit[1]}`).hide();
            $(`#varient-Delta7-${idSplit[1]}`).hide();
        } else if (deltaVisible) {
            $(`#varient-Delta7-${idSplit[1]}`).show();
            $(`#varient-Total-${idSplit[1]}`).hide();
            $(`#varient-Delta-${idSplit[1]}`).hide();
        } else if (delta7Visible) {
            $(`#varient-Total-${idSplit[1]}`).show();
            $(`#varient-Delta7-${idSplit[1]}`).hide();
            $(`#varient-Delta-${idSplit[1]}`).hide();
        }
        return;
    });
};


sortDateArray = (array, value) => {

    sortedDateArray = [];
    array.forEach(function(element) {
        let firstKey = Object.keys(element).find((keys) => keys);
        let object = {
            [firstKey]: element[firstKey].total[value] ? element[firstKey].total[value] : 0,
        };
        sortedDateArray.push(object);
    });
    return;
};