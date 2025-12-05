const defaultErrorMessage = 'Algo deu errado, tente novamente. Se o problema persistir, contate um Administrador do Sistema.';

let Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 6500
});

function Log() {
    this.ex = null;
    this.opt = null;
    this.instanceLog = this;
    this.sendErrorLog = function() {
        this.ex.code = this.opt.code;
        callMixinsAlertRemoteAction(window.URL['LOG_reportError'], JSON.stringify(this.ex), function (result, event) {
            if(event) {
                if(result.isSuccess) {
                    swal.close();
                    Toast.fire({
                        timer: 3000,
                        type: 'success',
                        title: `Seu erro foi registrado com sucesso. Obrigado por reportá-lo!`
                    });
                }else {
                    Log.fire(result, {
                        code: '994'
                    });
                }
            }else {
                Log.fire(result, {
                    code: '998'
                });
            }
        });
    };
    this.showErrorMessage = function (ex, opt) {
        if (typeof ex == 'undefined') {
            ex = {
                message: defaultErrorMessage,
                stackTrace: null
            };
        }
        if (ex == null) {
            ex = {
                message: defaultErrorMessage,
                stackTrace: null
            };
        }
        if (typeof ex == 'string'){
            ex = {
                message: ex
            }
        }
        if (!ex.hasOwnProperty('message')) {
            if (ex.hasOwnProperty('errorMessage')) {
                ex.message = ex.errorMessage;
            }
        }
        if (typeof ex.stackTrace == 'undefined') {
            ex.stackTrace = null;
        }
        if (typeof opt == 'undefined') {
            opt = {};
        }
        if (typeof opt.type == 'undefined') {
            opt.type = 'warning';
        }
        if (typeof opt.title == 'undefined') {
            opt.title = 'Oops...';
        }
        if (typeof opt.code == 'undefined') {
            opt.code = null;
        }
        if (typeof opt.open == 'undefined') {
            opt.open = false;
        }
        if (typeof opt.confirmText == 'undefined') {
            opt.confirmText = 'OK';
        }
        if (typeof opt.callback == 'undefined') {
            opt.callback = function (params) {};
        }
        this.ex = ex;
        this.opt = opt;
        let html = ex.message + ' <br/>';
        let time = (new Date()).getTime();
        if (ex.stackTrace != null) {
            html += '' +
                `
                <div class="log collapsible left">
                   <input type="checkbox" id="log-code-${time}" ${opt.open? 'checked="true"' : ''} />
                   <div class="collapsible-header">
                       <label for="log-code-${time}">
                            <i class="material-icons">chevron_right</i>
                            <small>${(opt.code != null ? 'CODE: [' + opt.code + ']' : 'Detalhes')}</small>
                       </label>
                   </div>
                   <div class="collapsible-body"><pre>${ex.stackTrace}</pre> ` + (window.URL['LOG_reportError'] ? `<a onclick="Log.sendErrorLogWrapper(${opt.code})">Avisar sobre esse erro</a>` : ``) + `</div>
                </div>
            `;
        } else if (opt.code != null) {
            html += '' +
            `
                <div class="collapsible">
                   <div class="collapsible-header">
                       <label for="log-code-${time}">
                           <small>CODE: [${opt.code}]</small>
                       </label>
                   </div>
                </div>
            `;
        }
        Swal.fire({
            type: opt.type,
            title: opt.title,
            html: html,
            confirmButtonText: opt.confirmText
        }).then((result) => {
            opt.callback(result);
            delete LogMap[opt.code];
        });
    };
}
var LogMap = {};
Log.fire = function (ex, opt) {
    if (typeof opt.code == 'undefined') {
        opt.code = null;
    }
    LogMap[opt.code] = new Log();
    LogMap[opt.code].showErrorMessage(ex, opt);
};

Log.sendErrorLogWrapper = function(code) {
    LogMap[code].sendErrorLog();
};

function callMixinsAlertRemoteAction(remoteAction, params, callback) {
    Visualforce.remoting.Manager.invokeAction(
        remoteAction, params,
        function (result, event) {
            callback(result, event);
        }, {
            buffer: false,
            escape: true,
            timeout: 300000
        }
    );
}

window.Log = Log;
window.Toast = Toast;