const brazilianStates = [
    {"name": "Acre", "initials": "AC"},
    {"name": "Alagoas", "initials": "AL"},
    {"name": "Amapá", "initials": "AP"},
    {"name": "Amazonas", "initials": "AM"},
    {"name": "Bahia", "initials": "BA"},
    {"name": "Ceará", "initials": "CE"},
    {"name": "Distrito Federal", "initials": "DF"},
    {"name": "Espírito Santo", "initials": "ES"},
    {"name": "Goiás", "initials": "GO"},
    {"name": "Maranhão", "initials": "MA"},
    {"name": "Mato Grosso", "initials": "MT"},
    {"name": "Mato Grosso do Sul", "initials": "MS"},
    {"name": "Minas Gerais", "initials": "MG"},
    {"name": "Pará", "initials": "PA"},
    {"name": "Paraíba", "initials": "PB"},
    {"name": "Paraná", "initials": "PR"},
    {"name": "Pernambuco", "initials": "PE"},
    {"name": "Piauí", "initials": "PI"},
    {"name": "Rio de Janeiro", "initials": "RJ"},
    {"name": "Rio Grande do Norte", "initials": "RN"},
    {"name": "Rio Grande do Sul", "initials": "RS"},
    {"name": "Rondônia", "initials": "RO"},
    {"name": "Roraima", "initials": "RR"},
    {"name": "Santa Catarina", "initials": "SC"},
    {"name": "São Paulo", "initials": "SP"},
    {"name": "Sergipe", "initials": "SE"},
    {"name": "Tocantins", "initials": "TO"}
];

function setDocumentPageTitle(title = '', prefix = '', sufix = '') {
    document.getElementsByTagName('title')[0].innerHTML = prefix + title + sufix;
}

function sSize(VAR_text) {
    return (VAR_text < 10 ? '0' + VAR_text : VAR_text)
}

function formatDate(date) {
    if(!date) {
        return false;
    }
    if (typeof date == 'string') {
        date = new Date(date + 'T12:00');
    }
    if (typeof date == 'number') {
        date = new Date(date);
        return sSize(date.getUTCDate()) + '/' + sSize(date.getUTCMonth() + 1) + '/' + date.getUTCFullYear();
    }
    return sSize(date.getDate()) + '/' + sSize(date.getMonth() + 1) + '/' + date.getFullYear();
}

function formatDateWhithouYear(date) {
    if(!date) {
        return false;
    }
    if (typeof date == 'string') {
        date = new Date(date + 'T12:00');
    }
    if (typeof date == 'number') {
        date = new Date(date);
        return sSize(date.getUTCDate()) + '/' + sSize(date.getUTCMonth() + 1);
    }
    return sSize(date.getDate()) + '/' + sSize(date.getMonth() + 1);
}

function formatDateEN(date) {
    if (typeof date == 'string') {
        date = new Date(date + 'T12:00');
    }
    if (typeof date == 'number') {
        date = new Date(date);
        return sSize(date.getUTCMonth() + 1) + '/' + sSize(date.getUTCDate()) + '/' + date.getUTCFullYear();
    }
    return sSize(date.getMonth() + 1) + '/' + sSize(date.getDate()) + '/' + date.getFullYear();
}

function formatDateCustom(dt, language = 'pt-br') {
    if(!dt) {
        return false;
    }
    if (typeof dt == 'string') {
        dt = new Date(dt + 'T12:00');
    }
    return dt.toLocaleString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateShortWeekday(dt, language = 'pt-br') {
    if(!dt) {
        return false;
    }
    if (typeof dt == 'string') {
        dt = new Date(dt + 'T12:00');
    }
    return dt.toLocaleString(language, { weekday: 'short' });
}

function formatDateBurndown(dt, language = 'pt-br') {
    if(!dt) {
        return false;
    }
    if (typeof dt == 'string') {
        dt = new Date(dt + 'T12:00');
    }
    return dt.toLocaleString(language, { weekday: 'short' }) + ' ' +  formatDateWhithouYear(dt);
}

function formatDateMonth(dt, language = 'pt-br') {
    if(!dt) {
        return false;
    }
    if (typeof dt == 'string') {
        dt = new Date(dt + 'T12:00');
    }
    if(dt.getFullYear() != (new Date()).getFullYear()) {
        return dt.toLocaleString(language, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return dt.toLocaleString(language, { month: 'long', day: 'numeric' });
}

function formatDateTimeCustom(dt) {
    dt = normalizeDate(dt);
    if(!dt) {
        return false;
    }
    let currDate = new Date();
    currDate.setHours(12);
    let indexDate = 0;
    let datesList = ['hoje', 'ontem', 'anteontem'];
    while(formatDate(dt) != formatDate(currDate)){
        currDate.setDate(currDate.getDate() - 1);
        indexDate++;
    }
    if(datesList.length > indexDate) {
        return datesList[indexDate] + ' às ' + formatTime(dt);
    }else if(indexDate < 5) {
        return dt.toLocaleString('pt-br', {weekday: 'long'}) + ' às ' + formatTime(dt);
    }
    return formatDate(dt) + ' às ' + formatTime(dt);
}

function formatDateForm(date) {
    if (typeof date == 'string') {
        date = new Date(date + 'T12:00');
    }
    if (typeof date == 'number') {
        date = new Date(date);
        return sSize(date.getUTCFullYear()) + '-' + sSize(date.getUTCMonth() + 1) + '-' + sSize(date.getUTCDate());
    }
    return sSize(date.getFullYear()) + '-' + sSize(date.getMonth() + 1) + '-' + sSize(date.getDate());
}

function formatDateTimeForm(date) {
    if (typeof date == 'string') {
        date = new Date(date + 'T12:00');
    }
    if (typeof date == 'number') {
        date = new Date(date);
        return sSize(date.getUTCFullYear()) + '-' + sSize(date.getUTCMonth() + 1) + '-' + sSize(date.getUTCDate() + 'T' + sSize(date.getUTCHours()) + '-' + sSize(date.getUTCMinutes()) + '-' + sSize(date.getUTCSeconds()));
    }
    return sSize(date.getFullYear()) + '-' + sSize(date.getMonth() + 1) + '-' + sSize(date.getDate() + 'T' + sSize(date.getHours()) + '-' + sSize(date.getMinutes()) + '-' + sSize(date.getSeconds()));
}

function formatPrice(price) {
    if (price == null) {
        price = 0.00;
    }
    return price.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });
};

function formatNumber(number, min = 2, max = null) {
    options = {
        minimumFractionDigits: min
    };
    if (number == null) {
        number = 0.00;
    }
    if(max != null) {
        options.maximumFractionDigits = max;
    }
    return number.toLocaleString('pt-br', options);
};