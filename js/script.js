// selector
const S_IMPORT_TABLE_AREA = '#importTableArea';
const S_IMPORT_TABLE_BUTTON = '#importTableButton';

const S_USER_ID = '#userId';
const S_USER_PASSWORD = '#userPassword';
const S_PUTTY_PATH = '#puttyPath';
const S_PUTTY_PATH_VALUE = 'C:\\Program Files\\PuTTY\\putty.exe';
const S_PUTTY_KEY = '#puttyKey';
const S_PUTTY_KEY_VALUE = 'C:\\Users\\hazhikko\\Desktop\\putty\\mykey.ppk';
const S_LAUNCH_BUTTON = '#launchButton';

const S_GROUP_SELECT = '#groupSelect';
const S_COMMON_CHECKBOX = '#commonCheckbox';
const S_SERVER_TABLE = '#serversTable';
const S_SERVER_TABLE_TR = S_SERVER_TABLE + ' > table > tbody > tr';

// CSS
const CSS_ODD_TR_COLOR = '#afeeee';

// Checkbox追加後のCell番号
const C_CHECKBOX = 0;
const C_GROUP = 1;
const C_NAME = 2;
const C_IP = 3;

$(function(){
    // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    // 初期値設定
    // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    $(S_PUTTY_PATH).val(S_PUTTY_PATH_VALUE);
    $(S_PUTTY_KEY).val(S_PUTTY_KEY_VALUE);

    // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    // クリックイベント
    // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

    $(S_IMPORT_TABLE_BUTTON).on('click', function() {
        checkTextEmpty(S_IMPORT_TABLE_AREA);
        importTable($(S_IMPORT_TABLE_AREA).val());
    });

    $(S_LAUNCH_BUTTON).on('click', function() {
        checkTextEmpty(S_USER_ID);
        // checkTextEmpty(S_USER_PASSWORD);　未使用
        checkTextEmpty(S_PUTTY_PATH);
        checkTextEmpty(S_PUTTY_KEY);
        launchPutty($(S_USER_ID).val(), $(S_USER_PASSWORD).val(), $(S_PUTTY_PATH).val(), $(S_PUTTY_KEY).val());
    });

    // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    // チェンジイベント
    // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    $(document).on('change', S_COMMON_CHECKBOX, function(){
        changeCheckbox('[name="check"]', $(this).prop('checked')? true : false);
    });
    
    $(document).on('change', S_GROUP_SELECT, function(){
        filterList($(this).val());
    });
});

/**
 * 入力されたテーブルタグを取り込んで新しいテーブルを作成する
 * @param {string} tableTag 取り込むテーブルタグ
 */
function importTable(tableTag) {
    // 古いテーブルを削除
    $(S_SERVER_TABLE).empty()

    // 扱いやすくするためDivに入れる
    $(S_SERVER_TABLE).append(tableTag);

    // trにグループを設定
    // 先頭セルにチェックボックス追加
    var groups = [];
    $(S_SERVER_TABLE_TR).each(function(i) {
        if (i == 0) {
            $(this).prepend('<td><input id="' + S_COMMON_CHECKBOX.replace('#', '') + '" type="checkbox"></td>'); 
        } else {
            $(this).prepend('<td><input name="check" type="checkbox" value="'+ i +'"></td>'); 
            var group = $(this).children('td')[C_GROUP].innerText;
            $(this).attr('data-group', group);
            groups.push({'text' : group, 'val' : group});
        }
    });
    // 偶数行に色付け
    setOddColor(S_SERVER_TABLE_TR, CSS_ODD_TR_COLOR);

    // groupの重複削除・ソート
    // IEがArray.fromに対応してない
    // groups = Array.from(new Set(groups)).sort();
    groups = filterUniqueItemsById(groups, 'text');
    groups.sort(function(a, b) {
        return (a.text < b.text) ? -1 : 1;
    });

    // 選択肢にALLを追加
    groups.unshift({'text' : 'ALL', 'val' : 'ALL'});

    // SelectにOptionをセット
    setSelectOption(S_GROUP_SELECT, groups);
}

/**
 * 連想配列の重複を削除する(IE対応)
 * @param {object} object 連想配列
 * @param {string} key 対象となるkey
 * @return {object} 重複削除済みの連想配列
 */
function filterUniqueItemsById (object, key) {
    // keyを集約した配列を作成
    const itemIds = object.map(function(item) {
        return item[key];
    });
    return object.filter(function(item, index) {
        return itemIds.indexOf(item[key]) === index;
    });
}

/**
 * 対象のSelectにOptionを設定する
 * @param {string} selector Selectのselector
 * @param {object} options 設定するOptionの連想配列{text, val}
 */
function setSelectOption(selector, options) {
    Object.keys(options).forEach( function(i) {
        var option = $('<option>')
            .text(options[i]['text'])
            .val(options[i]['val']);
        $(selector).append(option);
    }, options)
}

/**
 * 渡されたtrのうち、偶数のみ背景色を付ける
 * @param {string} selector trのselector
 * @param {string} color 背景色(16進)
 */
 function setOddColor(selector, color) {
    var i = 0;
    $(selector).each(function() {
        if ($(this).is(':visible')) {
            $(this).css('background', ( i % 2 ) == 0 ? color : 'transparent');
            i = i + 1;
        }
    });
}

/**
 * 対象のチェックボックスすべての状態を変更する
 * @param {string} selector Checkboxのselector
 * @param {boolean} visibleFlg 変更後の値
 */
function changeCheckbox(selector, visibleFlg) {
    $(selector).each(function(){
        // 表示状態のものだけ変更
        if ($(this).is(':visible')) {
            $(this).prop('checked', visibleFlg);
        }
    });
}

/**
 * 選択された値に該当する行のみ表示する
 * @param {string} filter 対象の値
 */
function filterList(filter) {
    // チェックボックスはすべてOFFにする
    changeCheckbox('[type="checkbox"]', false);

    $(S_SERVER_TABLE_TR).each(function(i) {
        if (i > 0) {
            if (filter == 'ALL') {
                $(this).show();
            } else {
                $(this).attr('data-group') == filter ? $(this).show() : $(this).hide();
            }
        }
    });
    // 偶数行に色付け
    setOddColor(S_SERVER_TABLE_TR, CSS_ODD_TR_COLOR);
}

/**
 * PuTTYでcheckされたIPに接続する
 * @param {string} userId userId
 * @param {string} userPassword userPassword
 * @param {string} puttyPath PuTTY.exeの絶対パス
 * @param {string} puttyKey PuTTYのPPKファイルの絶対パス
 */
function launchPutty(userId, userPassword, puttyPath, puttyKey) {
    // Program FilesだとCMDが動かないので置換(64bit用)
    puttyPath = puttyPath.replace('Program Files', 'PROGRA~1');
    var wsh = new ActiveXObject("WScript.Shell");
    var ip;
    var cmd;
    $('[name="check"]').each(function(){
        if ($(this).is(':visible') && $(this).prop('checked')) {
            ip = $(this).parents('tr').children('td')[C_IP].innerText;
            cmd = 'cmd /c ' + puttyPath  + ' -ssh ' + userId + '@' + ip + ' -i ' + puttyKey + ' & exit';
            console.log(cmd);
            wsh.run(cmd);
        }
    });
}

/**
 * 要素に値が入っているかチェックする
 * @param {string} selector チェック対象のselector
 */
function checkTextEmpty(selector) {
    try {
        if (!$(selector).val()) {
            alert($(selector).prop('placeholder') + 'が未入力です');
            // IEの場合、これだけだとなぜか止まらない
            throw new Error($(selector).prop('placeholder') + 'が未入力です');
        }
    } catch(e) {
        // こっちでも例外投げる
        throw new Error(e.message);
    }
}