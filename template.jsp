<!--Desenvolvido por Danilo Ferreira Adorno-->
<!DOCTYPE html>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ page import="java.util.*" %>
<%@ page import="java.sql.*" %>
<%@ page import="oracle.sql.*" %>
<%@ page import="java.io.*" %>

<%@ page import="br.com.sankhya.modelcore.profile.ApplicationProfileManager" %>
<%@ page import="br.com.sankhya.modelcore.auth.AuthenticationInfo" %>
<%@ page import="br.com.sankhya.modelcore.util.MGECoreParameter" %>
<%@ page import="br.com.sankhya.mge.core.services.AdministracaoServidorSP" %>

<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib uri="/WEB-INF/tld/sankhyaUtil.tld" prefix="snk" %>
    
<html lang="pt-br">

<head>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge"></meta>
    <meta charset="utf-8"></meta>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
    
    <!--vendors css-->
    <link rel="stylesheet" type="text/css" href="/mge/assets/vendors/ui-grid/ui-grid.min.css">
    <link rel="stylesheet" type="text/css" href="/mge/assets/vendors/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="/mge/assets/vendors/loading-bar.min.css">
    <link rel="stylesheet" type="text/css" href="/mge/js/jqwidgets/styles/jqx.base.css">
    <link rel="stylesheet" type="text/css" href="/mge/js/jqwidgets/styles/jqx.metro.css">
    <link rel="stylesheet" type="text/css" href="/mge/assets/css/snk.min.css">
    <link rel="SHORTCUT ICON" href="/mge/img/favicon.ico"></link>
    <link rel="stylesheet" type="text/css" href="/mge/assets/vendors/bpmn/css/diagram-js.css">
    <link rel="stylesheet" type="text/css" href="/mge/assets/vendors/bpmn/css/bpmn.css">
    <link rel="stylesheet" type="text/css" href="/mge/assets/vendors/bpmn/css/bpmnsnk.css">

    <!--vendors js-->
    <script type="text/javascript" src="/mge/js/sf/sf.js"></script>
    <script type="text/javascript" src="/mge/js/util/Base64.js"></script>
    <script type="text/javascript" src="/mge/js/AppletCaller.js"></script>
    <script type="text/javascript" src="/mge/js/html2canvas/html2canvas.min.js"></script>
    <script type="text/javascript" src="/mge/js/impressao.js"></script>

    <script type="text/javascript">

        console.log("Entrou em //Variáveis necessárias para que o SkApplication funcione");

        //Variáveis necessárias para que o SkApplication funcione
        var VSS = "2";
        var MGE_PARAMS = Base64.encode('mge.qtd.registros.mais.utilizados.reset__=__30__;__mge.qtd.registros.mais.utilizados.apresentacao__=__N__;__com.access.config.in.grid__=__N__;__mge.core.habilita.tela.html5__=__0__;__br.com.sankhya.mge.mostra.aviso.pagina.inicial__=__N__;__global.usa.app.cubo__=__S__;__global.porta.app.impressao__=__9096__;__mge.ativa.multi.abas__=__2__;__mge.core.tipo.consulta.automatica.cep__=__2__;__mge.qtd.registros.mais.utilizados.pesquisa__=__10__;__global.ordenar.acoes.personalizadas__=__N__;__global.carregar.registros.iniciar.tela__=__N__;__global.ordenar.filtros.personalizados__=__N__;__global.usa.app.impressao__=__S__;__com.configuracao.grade.respeita.config.tela__=__N__;__global.atalho.acoes.personalizadas__=__N__;__mge.core.config.form.html5__=__0__;__global.notifica.alteracao.dataset__=__N__;__mge.core.flex.theme__=__S__;__br.com.sankhya.modelcore.validacaosegurancafiltros__=__N__;__mge.core.modo.grade.configuravel.pesquisa__=__S__;__mge.core.qtde.maxima.registros.para.exportacao__=__5000__;__global.ordenar.abas.todasabas__=__N');
        var RAS = Base64.encode('A=true;C=true;D=true;E=true;F=true;G=true;I=true;N=true');
        var PCSF = '';
        var appProfile = '<%= ApplicationProfileManager.getInstance().isJivaW() ? "jiva" : "sankhya" %>';
        var UID = '<%= ((AuthenticationInfo) session.getAttribute("usuarioLogado")).getUserID().toString() %>';
        var MGESESSION = '<%= request.getSession().getId() %>';
        var USERMAIL = '<%= ((AuthenticationInfo) session.getAttribute("usuarioLogado")).getEmail() %>';
        var NOMEUSU = '<%= ((AuthenticationInfo) session.getAttribute("usuarioLogado")).getName() %>';

        var locale = 'pt_BR';
        var APPLICATION_NAME = '<%= AdministracaoServidorSP.getTituloBrowser() %>';
        var MODULE_ID = 'App';
        var PROFILEID = '<%= ApplicationProfileManager.getInstance().getProfileId() %>';
        var printerAppPort = 9096;
        var printerAppSSLPort = 9196;
        
        var isSecurityDomain = false;
        var localHostname = window.location.hostname;
        var workspace;
        try {
            var parentHostname = window.top.window.location.hostname;
            if (parentHostname == localHostname) {
                isSecurityDomain = true;
            }
        } catch (unsecurity) {}
        if (isSecurityDomain) {
            workspace = parent.workspace;
        }

        var i18nlocal = null; //    .i18n           : buildLocalI18nVar-method  : bundle do dicionário de dados
        var i18nAll = {}; //        .i18nBundles    : i18nVars-method           : bundle da aplicação, outras aplicações e defaults
        var i18nFramework = {}; //  .i18nBundles    : i18nVars-method           : bundle do framework

        console.log("Chegou no Final em //Variáveis necessárias para que o SkApplication funcione");


    </script>

    <snk:load/>
    
</head>

<body>

    <div id="pageWrapper" layout="column">
        <div id="page" ng-include="'${BASE_FOLDER}/main.html'" layout="column" flex ng-cloak></div>
    </div>

    <!--vendors1-->
    <script type="text/javascript" src="/mge/js/util/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/custom-native-functions.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/angular.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/angular-touch.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/angular-animate.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/angular-aria.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/angular-sanitize.min.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/angular/i18n/angular-locale_pt-br.js"></script>
    <script type="text/javascript" src="/mge/scripts/vendors/ui-bootstrap/ui-bootstrap-tpls.min.js"></script>
    
    <!--vendors2-->
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
    
    <!--vendors3-->
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

    <!--Controllers-->
    <script type="text/javascript" src="${BASE_FOLDER}/app.js">console.log("Chegou Em em ${BASE_FOLDER}/app.js");</script>
    <script type="text/javascript" src="${BASE_FOLDER}/popup/informarCodigoRastreio.controller.js"></script>
    <script type="text/javascript" src="${BASE_FOLDER}/popup/MotivoParada/motivoParadaPopUp.controller.js"></script>
    <script type="text/javascript" src="${BASE_FOLDER}/popup/AlterarCT/alterarctPopUp.controller.js"></script>
    <script type="text/javascript" src="${BASE_FOLDER}/popup/SelecaoRecursos/SelecaoRecursosPopUp.controller.js"></script>



    <script>

        console.log("Chegou noScript");

        //Altera conteúdo da div base do dashboard para novo iframe
        var dynaGadget = window.parent.document.getElementsByClassName('dyna-gadget')[0];
        var dashWindow = window.parent.document.getElementsByClassName("DashWindow")[0];

        console.log("dashWindow:" + dashWindow);
        if (typeof dashWindow != 'undefined'){

            var userID = UID;
            var nuGdg = '448';
            var dataAtual = new Date().toISOString().replace('T', ' ').replace('Z', '');
            var params = 'CODUSU_LOG='+userID+'&HOJE='+dataAtual.slice(0, 10)+' 00:00:00.0&INICIO_MES='+dataAtual.slice(0, 7)+'-01 00:00:00.0&AGORA='+dataAtual+'';
            var srcIframe = '/mge/html5component.mge?entryPoint=index.jsp&nuGdg='+nuGdg+'&gadGetID='+gadGetID+'&userID='+userID+'&params='+Base64.encode(params)+'';

            setTimeout(function(){
                dynaGadget.innerHTML = '<iframe src="'+srcIframe+'" class="gwt-Frame" style="width: 100%; height: 100%;"></iframe>';
            }, 100);
            
        } 
        
        var BASE_FOLDER = '${BASE_FOLDER}/';
        console.log(BASE_FOLDER);

        console.log("Final do Script");

    </script>

    <script>
        
        var ngAppName = "app";
        
        agGrid.LicenseManager.setLicenseKey("Sankhya_Gestao_de_Negocios_Sankhya-W_2Devs6_November_2020__MTYwNDYyMDgwMDAwMA==1f914bb75813904547879033c6de21d2");
        agGrid.initialiseAgGridWithAngular1(angular);

            angular
                .module(ngAppName)
                .run(function(SkI18nService, SkWorkspace){
                    SkWorkspace.unlockSwitchApp();
                    
                    SkI18nService.setLang(locale);
                    
                    angular.forEach(i18nAll, function(translations, bundleName){
                        SkI18nService.addBundle(locale, bundleName, translations);					
                    });
                    
                    angular.forEach(i18nFramework, function(translations, bundleName){
                        SkI18nService.addBundle(locale, bundleName, translations);					
                    });
                });


        function startApplication() {
            angular.bootstrap(document, [ngAppName]);
        }
    
    </script>

    <script src="/mge/scripts/launcher.js?v="></script>
    
    <applets>
        <div id="centralNotaAppletImpressao"></div>
        <div id="impressaoChequeApplet"></div>
    </applets>

    <!-- <script src="/mge/scripts/launcher.js"></script>

    <applets>
        <div id="centralNotaAppletImpressao"></div>
        <div id="impressaoChequeApplet"></div>
    </applets> -->
    
</body>

</html>
