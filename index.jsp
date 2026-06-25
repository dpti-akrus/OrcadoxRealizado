<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false"%>
<%@ page import="java.util.*" %>
<%@ page import="br.com.sankhya.modelcore.profile.ApplicationProfileManager" %>
<%@ page import="br.com.sankhya.modelcore.auth.AuthenticationInfo" %>
<%@ page import="br.com.sankhya.mge.core.services.AdministracaoServidorSP" %>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ taglib prefix="snk" uri="/WEB-INF/tld/sankhyaUtil.tld" %>

<%
    String embedded = request.getParameter("embedded");
    String nuGdg = request.getParameter("nuGdg");
    if (nuGdg == null || nuGdg.trim().isEmpty()) {
        nuGdg = "613";
    }

    AuthenticationInfo usuarioLogado = (AuthenticationInfo) session.getAttribute("usuarioLogado");
    String codusuLogado = usuarioLogado != null && usuarioLogado.getUserID() != null
        ? usuarioLogado.getUserID().toString()
        : "0";
    String nomeUsuarioLogado = usuarioLogado != null && usuarioLogado.getName() != null
        ? usuarioLogado.getName().replace("\\", "\\\\").replace("'", "\\'")
        : "";
    String emailUsuarioLogado = usuarioLogado != null && usuarioLogado.getEmail() != null
        ? usuarioLogado.getEmail().replace("\\", "\\\\").replace("'", "\\'")
        : "";
%>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <snk:load/>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lançamento Orçamentário</title>
    <link rel="stylesheet" href="${BASE_FOLDER}/assets/index-BlgbisUs.css" />

<% if ("true".equals(embedded)) { %>
    <script type="text/javascript" src="/mge/js/sf/sf.js"></script>
    <script type="text/javascript" src="/mge/js/util/Base64.js"></script>
    <script type="text/javascript" src="/mge/js/AppletCaller.js"></script>
    <script type="text/javascript" src="/mge/js/html2canvas/html2canvas.min.js"></script>
    <script type="text/javascript" src="/mge/js/impressao.js"></script>

    <script type="text/javascript">
        var VSS = "2";
        var MGE_PARAMS = typeof Base64 !== "undefined"
            ? Base64.encode("mge.core.habilita.tela.html5__=__0__;__mge.core.flex.theme__=__S")
            : "";
        var RAS = typeof Base64 !== "undefined" ? Base64.encode("A=true;C=true;D=true;E=true;F=true;G=true;I=true;N=true") : "";
        var PCSF = "";
        var appProfile = '<%= ApplicationProfileManager.getInstance().isJivaW() ? "jiva" : "sankhya" %>';
        window.SANKHYA_USER = {
            codusu: Number('<%= codusuLogado %>'),
            nome: '<%= nomeUsuarioLogado %>',
            email: '<%= emailUsuarioLogado %>'
        };

        var UID = String(window.SANKHYA_USER.codusu || 0);
        var MGESESSION = '<%= request.getSession().getId() %>';
        var USERMAIL = window.SANKHYA_USER.email;
        var NOMEUSU = window.SANKHYA_USER.nome;
        var locale = "pt_BR";
        var APPLICATION_NAME = '<%= AdministracaoServidorSP.getTituloBrowser() %>';
        var MODULE_ID = "App";
        var PROFILEID = '<%= ApplicationProfileManager.getInstance().getProfileId() %>';
        var printerAppPort = 9096;
        var printerAppSSLPort = 9196;
        var isSecurityDomain = false;
        var localHostname = window.location.hostname;
        var workspace = null;

        try {
            var parentHostname = window.top.window.location.hostname;
            if (parentHostname === localHostname) {
                isSecurityDomain = true;
                workspace = window.parent && window.parent.workspace ? window.parent.workspace : null;
            }
        } catch (unsecurity) {
            workspace = null;
        }

        var i18nlocal = null;
        var i18nAll = {};
        var i18nFramework = {};
    </script>
<% } %>
</head>
<body style="margin:0; padding:0; overflow:hidden;">

<% if (!"true".equals(embedded)) { %>
    <script>
        (function () {
            try {
                var dynaGadget = window.parent.document.getElementsByClassName("dyna-gadget")[0];
                var dashWindow = window.parent.document.getElementsByClassName("DashWindow")[0];

                if (typeof dashWindow !== "undefined" && dynaGadget) {
                    var srcIframe = "/mge/html5component.mge?entryPoint=index.jsp&nuGdg=<%= nuGdg %>&embedded=true";

                    setTimeout(function () {
                        dynaGadget.innerHTML =
                            '<iframe src="' + srcIframe + '" ' +
                            'class="gwt-Frame" ' +
                            'style="width:100%; height:100%; border:none;"></iframe>';
                    }, 100);
                }
            } catch (e) {
                console.log("Erro ao substituir gadget:", e);
            }
        })();
    </script>
<% } else { %>
    <div id="root"></div>

    <script type="text/javascript" src="/mge/js/util/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/custom-native-functions.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/angular.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/angular-touch.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/angular-animate.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/angular-aria.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/angular-sanitize.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/i18n/angular-locale_pt-br.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/ui-bootstrap/ui-bootstrap-tpls.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/ui-grid/ui-grid.modified.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/numeral/numeral.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/moment/moment.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/loading-bar/loading-bar.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/translate/angular-translate.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/sortable/sortable.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/ui-mask/mask.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/tinymce/tinymce.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/tinymce/uitinymce.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/tinymce/langs/pt_BR.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/tinymce/langs/en_CA.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/ace/ace.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/clipboard/clipboard.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/ag-grid/ag-grid-enterprise.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/bpmn/bpmn-custom-modeler.development.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxcore.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxdata.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxlistbox.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxbuttons.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxscrollbar.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxmenu.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxgrid.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxgrid.selection.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxgrid.columnsresize.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxgrid.columnsreorder.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxgrid.sort.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxgrid.filter.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxgrid.aggregates.js"></script>
    <script type="text/javascript" src="/mge/js/jqwidgets/jqxdropdownlist.js"></script>
    <script type="text/javascript" src="/mge/scripts/snk.js?v=1"></script>

    <script>
        var ngAppName = "app";

        if (window.agGrid && typeof window.agGrid.initialiseAgGridWithAngular1 === "function") {
            if (window.agGrid.LicenseManager) {
                window.agGrid.LicenseManager.setLicenseKey("Sankhya_Gestao_de_Negocios_Sankhya-W_2Devs6_November_2020__MTYwNDYyMDgwMDAwMA==1f914bb75813904547879033c6de21d2");
            }

            window.agGrid.initialiseAgGridWithAngular1(angular);
        }

        angular
            .module(ngAppName, ["snk"])
            .run(["ServiceProxy", function (ServiceProxy) {
                window.SankhyaService = {
                    consultar: function (requestBody) {
                        return ServiceProxy.callService("mge@crud.find", requestBody);
                    },
                    salvar: function (requestBody) {
                        return ServiceProxy.callService("mge@crud.save", requestBody);
                    },
                    callService: function (serviceName, requestBody) {
                        return ServiceProxy.callService(serviceName, requestBody);
                    }
                };

                window.__sankhyaBridgeInicializado = true;
                window.dispatchEvent(new Event("sankhya-ready"));
                console.log("[BOOT] SankhyaService pronto.");
            }]);

        window.startApplication = function () {
            angular.bootstrap(document, [ngAppName]);
        };
    </script>

    <script src="/mge/scripts/launcher.js?v="></script>
    <script type="module" src="${BASE_FOLDER}/assets/index-BPewjmlw.js"></script>
<% } %>

</body>
</html>
