var startDocument = "Paper";

$('#documentViewer').FlexPaperViewer(
    { config : {

        SWFFile : '../../CourseWares/Paper.pdf.swf',

        Scale : 0.6,
        ZoomTransition : 'easeOut',
        ZoomTime : 0.5,
        ZoomInterval : 0.2,
        FitPageOnLoad : true,
        FitWidthOnLoad : false,
        FullScreenAsMaxWindow : false,
        ProgressiveLoading : false,
        MinZoomSize : 0.2,
        MaxZoomSize : 5,
        SearchMatchAll : false,
        InitViewMode : 'Portrait',
        RenderingOrder : 'flash',
        StartAtPage : '',

        ViewModeToolsVisible : true,
        ZoomToolsVisible : true,
        NavToolsVisible : true,
        CursorToolsVisible : true,
        SearchToolsVisible : true,
        WMode : 'window',
        localeChain: 'en_US'
    }}
);