//Required Libraries for ESRI

require([
    "esri/views/MapView",
    "esri/Map",
    "esri/WebMap",
    "esri/config",
    "esri/layers/FeatureLayer",
    "esri/layers/MapImageLayer",
    "esri/widgets/LayerList",
    "esri/core/watchUtils",
    "esri/widgets/Popup",
    //"esri/layers/GraphicsLayer",
    "esri/geometry/geometryEngine",
    "esri/geometry/Point",
    "esri/tasks/support/FindParameters",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/tasks/support/StatisticDefinition",
    "esri/widgets/Legend",
    "esri/widgets/ScaleBar",
    "esri/layers/WMSLayer",
    // Require the basic 2d chart resource
    // "dojox/charting/Chart",
    // "dojox/gauges/AnalogGauge",
    // "dojox/gauges/AnalogArrowIndicator",
    // Require the theme of our choosing
    // "dojox/charting/themes/Tom",
    "esri/tasks/support/RelationshipQuery",
    "esri/Graphic",
    "esri/symbols/TextSymbol",
    "dojo/aspect",
    "dojo/query",
    "dojo/on",

    "dojo/dom",
    // "dojo/dom-construct",
    "dojo/domReady!",
    "esri/renderers/ClassBreaksRenderer"

], function (
    MapView,
    Map,
    WebMap,
    esriConfig,
    FeatureLayer,
    MapImageLayer,
    LayerList,
    watchUtils,
    Popup,
    //GraphicsLayer,
    geometryEngine,
    Point,
    FindParameters,
    QueryTask,
    Query,
    StatisticDefinition,
    Legend,
    ScaleBar,
    WMSLayer,
    RelationshipQuery,
    Graphic,
    TextSymbol,
    aspect,
    // Chart,
    // AnalogGauge,
    // AnalogArrowIndicator,
    // theme,
    dojo_query,
    on,
    dom
    //FieldTemplate,
    // domConstruct,


) {

    var dojoConfig = {
        has: {
            "esri-featurelayer-webgl": 1
        }
    };
    var damageValue = 8800000000;
    var Year = "Present";
    var myView = "Damage";
    var filterActive = false;
    var activeFilter = {type: "none", level: "none"};
    var updateFilterList = false;
    var firstRun = true;
    var nationalFirstRun = true;
    var myStorm = "0";
    var state = null;
    var myChart;
    var l = ["loading...", "loading..."];
    var data = [0, 0];
    var counter = 0;
    /************************************************************
     * Creates a new WebMap instance. A WebMap must reference
     * a PortalItem ID that represents a WebMap saved to
     * arcgis.com or an on-premise portal.
     *
     * To load a WebMap from an on-premise portal, set the portal
     * url with esriConfig.portalUrl.
     ************************************************************/
    esriConfig.portalUrl = "https://atlas.texascoastalatlas.com/arcgis";

    let webmap, webmap_US;

    webmap = new WebMap({
        basemap: "dark-gray",
        highlightOptions: {
            // //color: [255, 255, 0, 1],
            haloOpacity: 0.9,
            fillOpacity: 0.2
        }
    });
    webmap_US = new WebMap({
        basemap: "dark-gray",
        highlightOptions: {
            //color: [255, 255, 0, 1],
            haloOpacity: 0.9,
            fillOpacity: 0.2
        }

    });

    /************************************************************
     * Set the WebMap instance to the map property in a MapView.
     ************************************************************/

    let view, view_US;

    view = new MapView({
        map: webmap,
        center: [-94.961833, 29.567433],
        zoom: 9,
        container: "viewDiv_GalvestonBay",
        ui: {
            components: ["zoom", "attribution"]
        },
        highlightOptions: {
            //color: [255, 255, 0, 1],
            haloOpacity: 0.9,
            fillOpacity: 0.2
        }
    });
    // dom.byId("viewDiv_US").style.display = "none";
    view_US = new MapView({
        map: webmap_US,
        center: [-99, 39],
        zoom: 2,
        container: "Little_US",
        ui: {
            components: ["attribution"]
        },
        highlightOptions: {
            //color: [255, 255, 0, 1],
            haloOpacity: 0.9,
            fillOpacity: 0.2
        }
    });

    var scaleBar = new ScaleBar({
        view: view
    });
    // Add widget to the bottom left corner of the view
    view.ui.add(scaleBar, {
        position: "top-right"
    });

    var USscaleBar = new ScaleBar({
        view: view_US
    });
    // Add widget to the bottom left corner of the view
    view_US.ui.add(USscaleBar, {
        position: "top-right"
    });

    // Disable pan and zoom on US map

    /*view_US.on("drag", function(evt){

        // prevents panning with the mouse drag event
        evt.stopPropagation();
    });
    view_US.on("drag", ["Shift"], function (evt) {
        evt.stopPropagation();
    });
    view_US.on("drag", ["Shift", "Control"], function (evt) {
        evt.stopPropagation();
    });
    view_US.on("key-down", function (evt) {
        // prevents panning with the arrow keys
        var prohibitedKeys = ["+", "-", "Shift", "_", "="];
        var keyPressed = evt.key;
        if (keyPressed.slice(0, 5) === "Arrow") {
            evt.stopPropagation();
        }
        if (prohibitedKeys.indexOf(keyPressed) !== -1) {
            evt.stopPropagation();
        }
    });
    view_US.on("mouse-wheel", function (evt) {
        evt.stopPropagation();
    });
    view_US.on("double-click", function (evt) {
        evt.stopPropagation();
    });
    view_US.on("double-click", ["Control"], function (evt) {
        evt.stopPropagation();
    });*/

    /************************************************************
     * Disable Welfare Dropdown Option, Sector Dropdown, US Active Scenarios Box
     ************************************************************/
    dom.byId("Welfaremyonoffswitch").style.display = "none";
    // dom.byId("Sector").style.display = "none";
    dom.byId("USactiveScenariosContainer").style.display = "none";

    /************************************************************
     * Initialize nationalSLRmodal
     ************************************************************/
    $('#nationalSLRmodal').modal({show: false});

    /************************************************************
     * Identify On/Off switches by DOM used throughout the webpage
     ************************************************************/


    let pgTitle, SLR, Spine, Year2018, Year2080, Storm, Inundation, Damages, damage_dropdown, clear_query, city_query,
        county_query, state_query,
        HomeButton, usHomeButton,
        population_query, DamageButton, InundationButton, Year2018button, Year2080button, SpineButton,
        SLRMyOnOffSwitchContainer, SVI_query, previous_storm, previous_model_storm, local, national, sm_nation,
        sm_local, list, US_year_Slider,
        IkeButton, ModelButton,
        tabView;

    pgTitle = dom.byId("page_title");
    SLR = dom.byId("SLRMyOnOffSwitch");
    Spine = dom.byId("SpineMyOnOffSwitch");
    Year2018 = dom.byId("YearMyOnOffSwitch");
    Year2080 = dom.byId("Year2080MyOnOffSwitch");
    Storm = dom.byId("myRange");
    Inundation = dom.byId("Inundationmyonoffswitch");
    Damages = dom.byId("Damagemyonoffswitch");
    damage_dropdown = dom.byId("damageArea");
    clear_query = dom.byId("Clear_Query");
    city_query = dom.byId("City_Query");
    county_query = dom.byId("County_Query");
    population_query = dom.byId("Population_Query");
    state_query = dom.byId("StateDropdownButton");

    HomeButton = dom.byId("HomeSwitch");
    usHomeButton = dom.byId("usHomeSwitch");

    DamageButton = dom.byId("DamageButton");
    InundationButton = dom.byId("InundationButton");
    Year2018button = dom.byId("Year2018button");
    Year2080button = dom.byId("Year2080button");
    SpineButton = dom.byId("SpineButton");
    SLRMyOnOffSwitchContainer = dom.byId("SLRMyOnOffSwitchContainer");

    SVI_query = dom.byId("SVI_Query");
    previous_storm = myStorm;
    previous_model_storm = Storm.value;
    local = dom.byId("nav-local-tab");
    national = dom.byId("nav-national-tab");
    sm_nation = dom.byId("Little_US");
    sm_local = dom.byId("Little_Galveston");

    list = dom.byId("ExtraDropdownButton");

    IkeButton = dom.byId("IkeButton");
    ModelButton = dom.byId("ModelStormButton");
    US_year_Slider = dom.byId("timeslider");

    tabView = "Local";


    let US_Damage_Type, US_Down_Days, previous_US_Down_Days, Shutdown18, Shutdown26, Shutdown33, GDP, Welfare,
        Income,
        Chart_Statistic, Chart_Spine, Chart_DownTime, Chart_Both, Chart_Color, Chart_Label, Chart_Baseline, baseline,
        Chart_Title_Txt,
        Gas_Price, Insurance_Price, housing_Price, Food_Price,
        housing, petro, both, US_year;
    US_Damage_Type = "BOTH";
    US_year = 2017;
    US_Down_Days = 33;
    previous_US_Down_Days = US_Down_Days;
    Chart_Title_Txt = "Economic Activity";

    let USviewTxtGDP, USviewTxtIncome, USviewTxtGas, USviewLegendSub2016, USviewLegendSub2080;

    USviewTxtGDP = "Economic activity is estimated based on Gross Domestic Product (GDP), which is the value of the goods and services produced annually.";
    USviewTxtIncome = "Per capita income is the average income earned per person in a given year, including wages and salaries.";
    USviewTxtGas = "Gas prices are estimated based on the price of a broader set of petrochemical products, including lubricants, asphalt, and coal products as well as gasoline.";
    USviewTxtInsurance = "Insurance prices are estimated based on the price of insurance products and related services provided by insurance carriers, agencies, and brokerages.";
    USviewTxtHousing = "Housing prices are estimated based on the price of new single and multifamily residential structures.";
    USviewLegendSub2016 = "from no-storm scenario, after ";
    USviewLegendSub2080 = "from no-storm scenario";

    document.getElementById("USLegendSubtitle").innerHTML = USviewLegendSub2016 + (US_year - 2016) + " year";

    Shutdown18 = dom.byId("Shut18");
    Shutdown26 = dom.byId("Shut26");
    Shutdown33 = dom.byId("Shut33");
    // housing = dom.byId("Housing");
    // petro = dom.byId("Petro");
    // both = dom.byId("Both");
    GDP = dom.byId("GDPmyonoffswitch");
    Gas_Price = dom.byId("Gasmyonoffswitch");
    Insurance_Price = dom.byId("Insurancemyonoffswitch");
    housing_Price = dom.byId("Housingmyonoffswitch");
    Food_Price = dom.byId("Foodmyonoffswitch");
    Welfare = dom.byId("Welfaremyonoffswitch");
    Income = dom.byId("Incomemyonoffswitch");
    Chart_Statistic = "GDP";
    Chart_Spine = dom.byId("showBySpineButton");
    Chart_DownTime = dom.byId("showByDownTimeButton");
    Chart_Both = dom.byId("showByBothButton");
    Chart_Baseline = dom.byId("ShowBaselineButton");
    Chart_Color = "Spine";
    Chart_Label = "GDP change";
    baseline = false;


    var US_Chart_query = {
        State: " ",
        ShowBy: " ",
        Sector: " and Damage_Type = 'BOTH' "

    };

    /**
     * @return {string}
     */
    function Query_definition(SLR, Spine, Year, Storm) {
        return "year = '" + Year + "' AND spine = '" + Spine.value + "' AND storm = '" + stormProbability(Storm) + "' AND slr = '" + SLR.value + "'"
    }


    function US_Query_definition(Damage_Type, Spine, Down_Days, Storm, State, Year) {
        if (Damage_Type == 'housing') {
            Down_Days = 0;
        }
        if (Storm == "10" && Spine == "True") {
            if (State) {

                return "Storm = 'BAU' and state_NAME = '" + State + "'"
            } else {

                return "Storm = 'BAU'"
            }
        } else {
            if (State) {

                return "temp_table_Damage_Typ = '" + Damage_Type + "' and temp_table_Down_Days = " + Down_Days + " and temp_table_Spine = '" +
                    Spine + "' and temp_table_Storm  = '" + Storm + "' and temp_table_year = " + Year + " and state_NAME = '" + State + "'"
            } else {

                return "temp_table_Damage_Typ = '" + Damage_Type + "' and temp_table_Down_Days = " + Down_Days + " and temp_table_Spine = '" +
                    Spine + "' and temp_table_Storm  = '" + Storm + "' and temp_table_year = " + Year
            }
        }

    }


    function US_Query_definition_BAU(Damage_Type, Spine, Storm, State, Year) {
        if (Damage_Type == 'housing') {
            Down_Days = 0;
        }
        if (Storm == "10" && Spine == "True") {
            if (State) {

                return "Storm = 'BAU' and state_NAME = '" + State + "'"
            } else {

                return "Storm = 'BAU'"
            }
        } else {
            if (State) {

                return " temp_table_Storm  = '" + Storm + "' and temp_table_year = " + Year + " and state_NAME = '" + State + "'"
            } else {

                return " temp_table_Storm  = '" + Storm + "' and temp_table_year = " + Year
            }
        }

    }


    /************************************************************
     *Add Feature Layers to Galveston bay Web map.
     ************************************************************/

    let mask_layer, inundation_layer, damage_layer, coastal_spine, coastal_spine_outer, damageRenderer,
        spineRendererInner,
        spineRendererOuter, originalRenderer;
    let us_layer = [];

    mask_layer = new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/Mask/FeatureServer",
//			 outFields: ["*"],
        visible: true,
        opacity: 0.3,
        highlightOptions: {
            // color: [255, 255, 0, 1],
            haloOpacity: 0.9,
            fillOpacity: 0.2
        },
        renderer: {
            type: "simple",
            symbol: {
                type:"simple-fill",
                color: [
                    0,0,0,255
                ],
                outline: {
                    color: [
                        110,
                        110,
                        110,
                        255
                    ],
                    width: 0.7
                }
            },
        },
    });
    webmap.add(mask_layer);
    let sub_layers_array = [
        "Atlas:T10yr_dike",
        "Atlas:T100yr_dike",
        "Atlas:ike_dike",
        "Atlas:T500yr_dike",
        "Atlas:T10yr_base",
        "Atlas:T100yr_base",
        "Atlas:ike_base",
        "Atlas:T500yr_base",
        "Atlas:10y_slr_dike",
        "Atlas:100y_slr_dike",
        "Atlas:ike_slr_dike",
        "Atlas:500y_slr_dike",
        "Atlas:10y_slr_base",
        "Atlas:100y_slr_base",
        "Atlas:ike_slr_base",
        "Atlas:500y_slr_base"
    ]

    let sub_layer = []
    sub_layers_array.forEach(function(layer) {
        let vis = false
        if (layer ==="Atlas:ike_base"){
            vis =true
        }
        sub_layer.push({
            name: layer,
            visible: vis,
            legendUrl: "images/inundationLegend.png",

        })
    });

    inundation_layer = new WMSLayer({
        url: "https://tdis-geoserver.eastus.cloudapp.azure.com/geoserver/Atlas/wms?",
        visible: false,
        sublayers: sub_layer

    });
    webmap.add(inundation_layer);

    surge_popup = function (value, key, data) {
        var extra = ""
        if (data.Inundation_Count > 0) {
            extra = " This flooded <b>" + data.Inundation_Count + "</b> residential structures."
        }
        if (value > 1) {
            return "The mean inundation for residential structures was <b>" + value.toFixed(2) + "</b> feet." + extra
        } else if (value > 0) {
            return "The mean inundation for residential structures was <b>" + value.toFixed(2) + "</b> foot."
        }

    }
    damage_popup = function (value, key, data) {
        return value.toFixed(2)
    }
    commad = function (value, key, data) {
        return commarize(value, 2)
    }


    damage_layer = new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/Damages/FeatureServer",
        outFields: ["*"],
        fields: null,
        definitionExpression: Query_definition(SLR, Spine, Year, myStorm),
        highlightEnabled: true,
        renderer: Local_Damage_Render("damages"),
        popupTemplate: {
            title: "Losses and Inundation from the {storm} Storm",
            content: "For the {storm} Storm, residential losses were: <b>${damages:commad}</b>. {Mean_Surge:surge_popup} ",
            highlightEnabled: true
            //     [{
            //     // It is also possible to set the fieldInfos outside of the content
            //     // directly in the popupTemplate. If no fieldInfos is specifically set
            //     // in the content, it defaults to whatever may be set within the popupTemplate.
            //     type: "fields",
            //     fieldInfos: [{
            //         fieldName: "damages" ,
            //         label: "Losses from "+ stormProbability(myStorm),
            //         visible: true,
            //         format: {
            //             digitSeparator: true,
            //             places: 0
            //         }
            //     }, {
            //         fieldName:  "Mean_Surge" ,
            //         label: "Average Surge Level",
            //         visible: true,
            //         // format: {
            //         //
            //         //     digitSeparator: true,
            //         //
            //         // }
            //     }]
            // }]
        }
//        opacity: 0.7
    });

    webmap.add(damage_layer);

    coastal_spine_outer = new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/GLO_Tables/FeatureServer",
        outFields: ["*"],
        visible: false,
    });
    webmap.add(coastal_spine_outer);

    coastal_spine = new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/GLO_Tables/FeatureServer",
        outFields: ["*"],
        visible: false,
    });
    webmap.add(coastal_spine);

    damageRenderer = {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
            type: "simple-fill",  // autocasts as new SimpleMarkerSymbol()
            style: "none",
            outline: {  // autocasts as new SimpleLineSymbol()
                width: 0.5,
                color: "#ff006e",
            }
        }
    };

    spineRendererInner = {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
            type: "simple-line",  // autocasts as new SimpleMarkerSymbol()
            color: "#ee505a",
            width: 2,
            style: "short-dot",
        }
    };

    spineRendererOuter = {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
            type: "simple-line",  // autocasts as new SimpleMarkerSymbol()
            color: "#000000",
            width: 4,
            style: "solid",
        }
    };


    // helper function to create a symbol
    function createSymbol(color, line_width = 0.5) {

        return {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: color,
            outline: {
                width: line_width,
                color: [100, 100, 100, 0.4]
            },
            style: "solid"
        };
    }


    var pink_damage = new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/Damages/FeatureServer",
        outFields: ["*"],
        fields: null,
        visible: false,
        definitionExpression: Query_definition(SLR, Spine, Year, myStorm),
        renderer: damageRenderer,
        highlightEnabled: true,
        popupTemplate: {
            title: "Losses and Inundation from the {storm} Storm",
            content: "For the {storm} Storm, residential losses were: <b>${damages:commad}</b>. {Mean_Surge:surge_popup} ",
            highlightEnabled: true
        }
    });
    webmap.add(pink_damage);

    /*****************************************************************
     * Create renderers for each block groups sublayer
     *****************************************************************/
    function US_Render(myfield) {
        console.log(myfield)
        return {
            type: "class-breaks", // autocasts as new ClassBreaksRenderer()
            field: myfield,
            classBreakInfos: [{
                minValue: -100,
                maxValue: -0.025,
                label: "< -2.5%",
                symbol: createSymbol("#c51b7d")
            }, {
                minValue: -0.025,
                maxValue: -0.01,
                label: "-1% to -2.5%",
                symbol: createSymbol("#e9a3c9")
            }, {
                minValue: -0.01,
                maxValue: -0.0001,
                label: "-0.01% to -1%",
                symbol: createSymbol("#fde0ef")
            }, {
                minValue: -0.0001,
                maxValue: 0.0001,
                label: "No change (< ±0.01%)",
                symbol: createSymbol("#f7f7f7")
            }, {
                minValue: 0.0001,
                maxValue: 0.005,
                label: "0.01% to +0.5%",
                symbol: createSymbol("#e6f5d0")
            }, {
                minValue: 0.005,
                maxValue: 0.01,
                label: "+0.5% to +1%",
                symbol: createSymbol("#a1d76a")
            }, {
                minValue: 0.01,
                maxValue: 10580,
                label: "> +1%",
                symbol: createSymbol("#4d9221")
            }]
        };
    };

    function Price_render(field) {
        return {
            type: "class-breaks", // autocasts as new ClassBreaksRenderer()
            field: field,
            classBreakInfos: [{
                minValue: -100,
                maxValue: -0.02,
                label: "< -2%",
                symbol: createSymbol("#d01c8b")
            }, {
                minValue: -0.02,
                maxValue: -0.0001,
                label: "-0.01% to -2%",
                symbol: createSymbol("#f1b6da")
            }, {
                minValue: -0.0001,
                maxValue: 0.0001,
                label: "No change (< ±0.01%)",
                symbol: createSymbol("#f7f7f7")
            }, {
                minValue: 0.0001,
                maxValue: 0.01,
                label: "0.01% to +1%",
                symbol: createSymbol("#e6f5d0")
            }, {
                minValue: 0.01,
                maxValue: 0.02,
                label: "+1% to +2%",
                symbol: createSymbol("#b8e186")
            }, {
                minValue: 0.02,
                maxValue: 0.04,
                label: "+2% to +4%",
                symbol: createSymbol("#7fbc41")
            }, {
                minValue: 0.04,
                maxValue: 100,
                label: "> +4%",
                symbol: createSymbol("#4d9221")
            }]
        }
    };

    var welfareRenderer = {
        type: "class-breaks", // autocasts as new ClassBreaksRenderer()
        field: "temp_table_Welfare",
        classBreakInfos: [{
            minValue: -55.6,
            maxValue: -15,
            label: "-$55.6 - -$15",
            symbol: createSymbol("#c51b7d")
        }, {
            minValue: -15,
            maxValue: -0.5,
            label: "-$15 - -$0.5",
            symbol: createSymbol("#e9a3c9")
        }, {
            minValue: -0.5,
            maxValue: -0.000001,
            label: "-$0.5 - $0",
            symbol: createSymbol("#fde0ef")
        }, {
            minValue: -0.000001,
            maxValue: 0.1,
            label: "$0 - $0.1",
            symbol: createSymbol("#e6f5d0")
        }, {
            minValue: 0.1,
            maxValue: 0.5,
            label: "$0.1 - $0.5",
            symbol: createSymbol("#a1d76a")
        }, {
            minValue: 0.5,
            maxValue: 1.4,
            label: "$0.5 - $1.4",
            symbol: createSymbol("#4d9221")
        }]
    };

    function Local_Damage_Render(field) {
        return {
            type: "class-breaks", // autocasts as new ClassBreaksRenderer()
            field: field,
            classBreakInfos: [{

                minValue: 0,
                maxValue: 100000,
                label: "≤$100,000",
                symbol: createSymbol("#FEF0D9", 0)
            }, {
                minValue: 100000,
                maxValue: 950000,
                label: "≤$950,000",
                symbol: createSymbol("#fdcc8a", 0)
            }, {
                minValue: 950000,
                maxValue: 7500000,
                label: "≤$7,500,000",
                symbol: createSymbol("#FC8D50", 0)
            }, {
                minValue: 7500000,
                maxValue: 60000000,
                label: "≤$60,000,000",
                symbol: createSymbol("#E34A33", 0)
            }, {
                minValue: 60000000,
                maxValue: 625000000,
                label: "≤$625,000,000",
                symbol: createSymbol("#B30000", 0)
            }]
        };
    };
    /*****************************************************************
     * Create a MapImageLayer instance with three sublayers pointing
     * to a single map service layer. Each layer uses the same data
     * but dynamically renders the data differently for each layer.
     *****************************************************************/
    cleanGDP = function (value, key, data) {
        return commarize(value * 1000000000, 2)

    }
    changePercent = function (value, key, data) {
        if (value > 0) {
            return "an <b> increase</b> of " + Math.abs(value * 100).toFixed(2) + " % from baseline"
        } else return "a <b> decrease</b> of " + Math.abs(value * 100).toFixed(2) + " % from baseline"
    }
    getStateName = function (value, key, data) {
        var stateName
        stateList.forEach(function (state) {
           if (value == state.abbreviation) {
              stateName = state.name
            }
        });

        return (stateName)

    }

    us_layer.push(new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/US_Impacts/FeatureServer",
        title: "Change in US economic indicator",
        id:0,
        renderer: US_Render("temp_table_GDP_change"),

        definitionExpression: US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year),
        visible: true,
        popupTemplate: {
            title: "GDP for {temp_table_Storm}",
            content: "For {state_STUSPS:getStateName}, GDP was ${temp_table_GDP:cleanGDP}. This was {temp_table_GDP_change:changePercent}",
            highlightEnabled: true,

        }
    }))
    us_layer.push(new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/US_Impacts/FeatureServer",
        title: "Income",
        id:1,
            renderer: US_Render("temp_table_income_cha"),
            definitionExpression: US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year),
            visible: false,
            highlightEnabled: true,
            popupTemplate: {
                title: "Income for " + stormProbability(myStorm),
                content: "For {state_STUSPS:getStateName}, the median Income was ${temp_table_income}. This was {temp_table_income_cha:changePercent}"
            },
    }))
    us_layer.push(new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/US_Impacts/FeatureServer",
        title: "Welfare",
        id:2,
        renderer: US_Render("temp_table_Welfare_ch"),
        definitionExpression: US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year),
        visible: false,
        highlightEnabled: true,
    }))
    us_layer.push(new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/US_Impacts/FeatureServer",
        title: "Gas Price Percent Changes",
        id:3,
        renderer: Price_render("temp_table_Petro_pr_1"),
        definitionExpression: US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year),
        visible: false,
        highlightEnabled: true,
        popupTemplate: {
            title: "Gas Prices for {temp_table_Storm}",
            content: "For {state_STUSPS:getStateName}, Gas prices had {temp_table_Petro_pr_1:changePercent}"

        },
    }))
    us_layer.push(new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/US_Impacts/FeatureServer",
        title: "Food Price Percent Changes",
        id:4,
        renderer: Price_render("temp_table_Fruits_v_1"),
        definitionExpression: US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year),
        visible: false,
        highlightEnabled: true,
    }))
    us_layer.push(new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/US_Impacts/FeatureServer",
        title: "Insurance Price Percent Changes",
        id:5,
        renderer: Price_render("temp_table_Insurance1"),
        definitionExpression: US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year),
        visible: false,
        highlightEnabled: true,
        popupTemplate: {
            title: "Insurance Prices for {temp_table_Storm}",
            content: "For {state_STUSPS:getStateName}, Insurance prices had {temp_table_Insurance1:changePercent}"

        },
    }))
    us_layer.push(new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/US_Impacts/FeatureServer",
        title: "Housing Price Percent Changes",
        id:6,
        renderer: Price_render("temp_table_Dwelling_1"),
        definitionExpression: US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year),
        visible: false,
        highlightEnabled: true,
        popupTemplate: {
            title: "Housing Prices for {temp_table_Storm}",
            content: "For {state_STUSPS:getStateName}, Housing prices had {temp_table_Dwelling_1:changePercent}"

        },
    }))



    console.log(us_layer)
    us_layer.forEach(function (layer) {
        webmap_US.add(layer);

    });


    /************************************************************
     * Create text graphic to annotate "no change with spine"
     * scenarios on US map
     ************************************************************/

    let txtPoint, txtSymbol, txtGraphic;

    txtPoint = new Point({
        latitude: 39.833333,
        longitude: -98.583333
    });

    txtSymbol = new TextSymbol({
        color: "gray",
        //backgroundColor: "black",
        haloColor: "white",
        haloSize: "1px",
        yoffset: "-20px",
        text: "Minimal Impacts Expected",
        font: {  // autocast as new Font()
            size: 16,
            family: "sans-serif",
            weight: "bold"
        }
    });

    txtGraphic = new Graphic({
        geometry: txtPoint,
        symbol: txtSymbol
    });

    /************************************************************
     * add legend
     ************************************************************/
    let legend, subLegend, legend_US;

    legend = new Legend({
        view: view,
        container: document.createElement("div"),
        layerInfos: [
            {
                layer: inundation_layer,
                title: null,
                label: null,
            },
            {
                layer: damage_layer,
                title: null,
                label: null,

                //infoTemplate: template
            },
        ]
    });
    legend.container.style = "height: 100%";
    let panelDiv = document.getElementById("legend_GalavestonBay");
    panelDiv.appendChild(legend.container);

    /************************************************************
     * add sub-legend for spine, filtered areas
     ************************************************************/

    subLegend = new Legend({
        view: view,
        container: document.createElement("div"),
        layerInfos: [
            {
                layer: coastal_spine,
                title: "Coastal Spine",
                label: null,
            },
        ]
    });
    subLegend.container.style = "height: 100%";
    let subPanelDiv = document.getElementById("sub-legend");
    subPanelDiv.appendChild(subLegend.container);

    function setSubLegend() {
        if ((Spine.value === "True") || (filterActive && myView === "Inundation")) {
            if (filterActive && myView === "Inundation") {
                subLegend.layerInfos = [
                    {
                        layer: coastal_spine,
                        title: "Coastal Spine",
                        label: null,
                    },
                    {
                        layer: pink_damage,
                        title: "Filtered Areas",
                        label: null,
                    }
                ];
            } else {
                subLegend.layerInfos = [
                    {
                        layer: coastal_spine,
                        title: "Coastal Spine",
                        label: null,
                    }
                ];
            }
            document.getElementById("sub-legend").style.display = "block";
        } else {
            document.getElementById("sub-legend").style.display = "none";
        }
    }


    

    /************************************************************
     * Storm Probability Function Returns Slider Value as Storm Probabilty
     ************************************************************/


    function stormProbability(value) {
        if (value === "1") {
            return "10";
        } else if (value === "2") {
            return "100";
        } else if (value === "0") {
            return "Ike";
        } else if (value === "3") {
            return "500";
        }
    }

    function stormValue(value) {
        if (value === "1") {
            damageValue = 2700000000;
            return damageValue;
        } else if (value === "2") {
            damageValue = 19000000000;
            return damageValue;
        } else if (value === "0") {
            damageValue = 8800000000;
            return damageValue;
        } else if (value === "3") {
            damageValue = 32000000000;
            return damageValue;
        }
    }

    /************************************************************
     *Get Pseudo COde element
     ************************************************************/
    var UID = {
        _current: 0,
        getNew: function () {
            this._current++;
            return this._current;
        }
    };

    HTMLElement.prototype.pseudoStyle = function (element, prop, value) {
        var _this = this;
        var _sheetId = "pseudoStyles";
        var _head = document.head || document.getElementsByTagName('head')[0];
        var _sheet = document.getElementById(_sheetId) || document.createElement('style');
        _sheet.id = _sheetId;
        var className = "pseudoStyle" + UID.getNew();

        _this.className += " " + className;

        _sheet.innerHTML += " ." + className + ":" + element + "{" + prop + ":" + value + "}";
        _head.appendChild(_sheet);
        return this;
    };

    /************************************************************
     * Change Web Map
     ************************************************************/


    $('#nav-tab a[href="#nav-national"]').on('show.bs.tab', function (e) {
        tabView = "National";
        if (Year == "2080") {
            SLR.value = "True";
            document.getElementById('SLRMyOnOffSwitchText').style.borderBottom = "2px solid #3DC4C4";
            SLR.src = "images/sea.svg";
        }
        view.ui.components = ["attribution"];
        view.container = "Little_Galveston";

        view_US.ui.components = ["attribution", "zoom"];
        view_US.container = "viewDiv_US";

        switch (myView) {
            case "Damage":
                view.whenLayerView(damage_layer)
                    .then(function (layerView) {
                        setTimeout(function () {
                            view.goTo({target: view.center, zoom: view.zoom - 1});
                        }, 1000);
                    })
                    .catch(function (error) {
                        // An error occurred during the layerview creation
                    });
                break;
            case "Inundation":
                view.whenLayerView(inundation_layer)
                    .then(function (layerView) {
                        webmap.remove(inundation_layer);
                        setTimeout(function () {
                            view.goTo({target: view.center, zoom: view.zoom - 1});
                            webmap.add(inundation_layer);
                            webmap.reorder(inundation_layer, 0);
                        }, 1000);
                    })
                    .catch(function (error) {
                        console.log("An error occurred during the layerview creation");
                    });
                break;
        }

        view_US.whenLayerView(us_layer)
            .then(function (layerView) {
                setTimeout(function () {
                    view_US.goTo({target: view_US.center, zoom: view_US.zoom + 1});
                    watchUtils.when(view, "animation", function (animation) {
                        animation.when(function (animation) {
                            us_layer.refresh();
                        })
                    });
                }, 4000);
            })
            .catch(function (error) {
                console.log("An error occurred during the layerview creation");
            });

        if (nationalFirstRun) {
            $('#nationalDescriptionModal').modal('show');
            setTimeout(function () {
                myChart = US_Chart(Chart_Statistic, Chart_Color, Chart_Label);
                if (Spine.value == "True" && (stormProbability(myStorm) == "Ike" || stormProbability(myStorm) == "10")) {
                    var spine_query = US_Query_definition("housing", "False", 0, "BAU", state, US_year);
                } else {
                    var spine_query = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
                }

                US_Chart_data(spine_query);
                document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"));
                US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

			/************************************************************
     		* Create US legend
    		* Legend then added once a panel is created.
     		************************************************************/
    		legend_US = new Legend({
        		view: view_US,
        		container: document.createElement("div"),
        		layerInfos: [{
            		layer: us_layer[0],
            		title: null,
            		label: null
        		}]
    		});
    		legend_US.container.style = "height: 100%";
        	let panelDiv_US = document.getElementById("legend_US");
        	panelDiv_US.appendChild(legend_US.container);
    		//console.log(legend_US);

    		/*view.when(function () {
        		watchUtils.when(legend_US, "container", function () {


            		watchUtils.when(legend, "container", function () {
                		aspect.after(legend, "scheduleRender", function (response) {
                    		if (dojo_query('.esri-legend__layer-caption')[0]) {
                        		dojo_query('.esri-legend__layer-caption')[0].style.display = 'none';
                        		try {
                            		dojo_query('.esri-legend__layer-caption')[1].style.display = 'none';
                        		} catch (e) {

                        		}

                    		}
                		});
            		});


        		});
    		});*/
                // US_chart_Var.setData(datasource);
            }, 1000);
            nationalFirstRun = false;
        }
        /*else {
            setTimeout(function () {
                // US_chart_Var.setData(datasource);
            }, 300);
        }*/
    });

    $('#nav-tab a[href="#nav-local"]').on('show.bs.tab', function (e) {

        tabView = "Local";
        view.ui.components = ["attribution", "zoom"];
        view.container = "viewDiv_GalvestonBay";

        view_US.ui.components = ["attribution"];
        view_US.container = "Little_US";

        switch (myView) {
            case "Damage":
                view.whenLayerView(damage_layer)
                    .then(function (layerView) {
                        setTimeout(function () {
                            view.goTo({target: view.center, zoom: view.zoom + 1});
                            setQueryListener();
                        }, 1000);
                    })
                    .catch(function (error) {
                        // An error occurred during the layerview creation
                    });
                break;
            case "Inundation":
                view.whenLayerView(inundation_layer)
                    .then(function (layerView) {
                        webmap.remove(inundation_layer);
                        setTimeout(function () {
                            view.goTo({target: view.center, zoom: view.zoom + 1});
                            webmap.add(inundation_layer);
                            webmap.reorder(inundation_layer, 0);
                            setQueryListener();
                        }, 1000);
                    })
                    .catch(function (error) {
                        console.log("An error occurred during the layerview creation");
                    });
                break;
        }

        view_US.whenLayerView(us_layer)
            .then(function (layerView) {
                setTimeout(function () {
                    view_US.goTo({target: view_US.center, zoom: view_US.zoom - 1});
                    watchUtils.when(view, "animation", function (animation) {
                        animation.when(function (animation) {
                            us_layer.refresh();
                        })
                    });
                }, 1000);
            })
            .catch(function (error) {
                console.log("An error occurred during the layerview creation");
            });
    });

    $('[href="#nav-national-preview"]').on('show.bs.tab', function (e) {
        document.getElementById("smallTabContentLocal").classList.remove("scrollDiv");
        view_US.whenLayerView(us_layer)
            .then(function (layerView) {
                setTimeout(function () {
                    view_US.goTo({target: view_US.center, zoom: view_US.zoom});
                    watchUtils.when(view, "animation", function (animation) {
                        animation.when(function (animation) {
                            us_layer.refresh();
                        })
                    });
                }, 1000);
            })
            .catch(function (error) {
                console.log("An error occurred during the layerview creation");
            });
    });

    $('[href="#nav-local-directions"]').on('show.bs.tab', function (e) {
        document.getElementById("smallTabContentLocal").classList.add("scrollDiv");
    });

    $('[href="#nav-local-preview"]').on('show.bs.tab', function (e) {
        document.getElementById("smallTabContentNational").classList.remove("scrollDiv");
    });

    $('[href="#nav-national-directions"]').on('show.bs.tab', function (e) {
        document.getElementById("smallTabContentNational").classList.add("scrollDiv");
    });

    on(sm_nation, "click", function () {
        $('#nav-tab a[href="#nav-national"]').tab('show');
    });
    on(sm_local, "click", function () {
        $('#nav-tab a[href="#nav-local"]').tab('show');
    });

    /************************************************************
     * Liquid Gauge
     ************************************************************/
    var liquid_gauge;
    var gauge_config = liquidFillGaugeDefaultSettings();
    gauge_config.maxValue = 25;
    // gauge_config.displayPercent= false;
    gauge_config.circleThickness = 0.1;
    gauge_config.circleFillGap = 0.2;
    gauge_config.valueCountUp = false;
    gauge_config.textVertPosition = 0.8;
    gauge_config.waveAnimateTime = 2000;
    gauge_config.waveAnimate = true;
    gauge_config.waveHeight = 0.3;
    gauge_config.waveCount = 1;

    var svg_gauge = dom.byId("inundation_gauge");
    svg_gauge.parentNode.removeChild(svg_gauge);


    /************************************************************
     * US Chart
     ************************************************************/
    var US_chart_Var;
    var datasource;
    var us_layer_query = new FeatureLayer({
        url: "https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/US_Impacts_16_66/FeatureServer",
        outFields: ["*"],
        visible: false,

    });
    webmap_US.add(us_layer_query);


    function US_Chart_data() {

        var Statistic_Average = [{
            onStatisticField: "temp_table_GDP",
            outStatisticFieldName: "GDP",
            statisticType: "sum"
        }];

        Statistic_Average.push({
            onStatisticField: "temp_table_income_cha",
            outStatisticFieldName: "Income_Change",
            statisticType: "avg"
        });
        Statistic_Average.push({
            onStatisticField: "temp_table_Welfare_ch",
            outStatisticFieldName: "Welfare_Change",
            statisticType: "avg"
        });
        Statistic_Average.push({
            onStatisticField: "temp_table_Petro_pr_1",
            outStatisticFieldName: "Petrol_Product_Change",
            statisticType: "avg"
        });
        Statistic_Average.push({
            onStatisticField: "temp_table_GDP_change",
            outStatisticFieldName: "GDP_Change",
            statisticType: "avg"
        });
        Statistic_Average.push({
            onStatisticField: "temp_table_income",
            outStatisticFieldName: "Income",
            statisticType: "avg"
        });
        Statistic_Average.push({
            onStatisticField: "temp_table_Welfare",
            outStatisticFieldName: "Welfare",
            statisticType: "avg"
        });
        Statistic_Average.push({
            onStatisticField: "temp_table_Petro_prod",
            outStatisticFieldName: "Petrol_Product",
            statisticType: "avg"
        });
        Statistic_Average.push({
            onStatisticField: "temp_table_Dwelling_P",
            outStatisticFieldName: "Housing_Price",
            statisticType: "avg"
        });
        Statistic_Average.push({
            onStatisticField: "temp_table_Dwelling_1",
            outStatisticFieldName: "Housing_Price_Change",
            statisticType: "avg"
        });
        Statistic_Average.push({
            onStatisticField: "temp_table_Insurance_",
            outStatisticFieldName: "Insurance_Price",
            statisticType: "avg"
        });
        Statistic_Average.push({
            onStatisticField: "temp_table_Insurance1",
            outStatisticFieldName: "Insurance_Price_Change",
            statisticType: "avg"
        });
        // Statistic_Average.push({
        //     onStatisticField: "temp_table_Fruits_veg",
        //     outStatisticFieldName: "Food_Price",
        //     statisticType: "avg"
        // });
        // Statistic_Average.push({
        //     onStatisticField: "temp_table_Fruits_v_1",
        //     outStatisticFieldName: "Food_Price_Change",
        //     statisticType: "avg"
        // });


        var US_Data = [];
        var where;
        group = ["temp_table_Spine", "temp_table_Down_Days"]
        if (('Ike' == stormProbability(myStorm)) || ('10' == stormProbability(myStorm))) {
            where = "(" + US_Query_definition(US_Damage_Type, "False", 33, stormProbability(myStorm), state, US_year) + ") or (" + US_Query_definition_BAU('housing', "False", 'BAU', state, US_year) + ")"

        } else {
            where = "(" + US_Query_definition(US_Damage_Type, "False", US_Down_Days, stormProbability(myStorm), state, US_year) + ") or (" + US_Query_definition(US_Damage_Type, "True", US_Down_Days, stormProbability(myStorm), state, US_year) + ")"
        }
        us_layer_query.queryFeatures({
            geometry: view_US.extent,
            returnGeometry: false,
            outStatistics: Statistic_Average,
            groupByFieldsForStatistics: group,
            spatialRelationship: "intersects",
            where: where,

            outFields: ["*"]
        }).then(function (results) {


            var GPD_dict = {};
            var Welfare_dict = {};
            var Income_dict = {};

            for (r = 0; r < results.features.length; r++) {

                var features = results.features[r];
                var t = features.attributes;

                dict = {};
                // dict["ID"] = t.OBJECTID;
                dict["GDP"] = t.GDP;

                dict["Welfare"] = t.Welfare;

                dict["Income"] = t.Income;
                dict["Petrol Product"] = t.Petrol_Product;
                dict["GDP Change"] = t.GDP_Change * 100;

                dict["Welfare Change"] = t.Welfare_Change * 100;

                dict["Income Change"] = t.Income_Change * 100;
                dict["Petrol Product Change"] = t.Petrol_Product_Change * 100;
                dict["Spine"] = withSpine(t.temp_table_Spine, t.temp_table_Down_Days);

                dict["Housing Price"] = t.Housing_Price;
                dict["Housing Price Change"] = t.Housing_Price_Change * 100;
                dict["Insurance Price"] = t.Insurance_Price;
                dict["Insurance Price Change"] = t.Insurance_Price_Change * 100;
                dict["Food Price"] = t.Food_Price;
                dict["Food Price Change"] = t.Food_Price_Change * 100;
                US_Data.push(dict);
            }
            datasource = US_Data;
        }).then(function () {
            try {
                document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"));
                US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

            } catch (e) {

                console.log("err")
            }
        });

    }

    function withSpine(spine, down_days) {

        if (down_days == 0) {
            return "Spine"
        }
        if (spine == "True") {
            return "Spine"
        } else {
            return "No Spine"
        }
    }

    function commarize(value, decimal) { // Makes Large numbers easily readable.
        // Alter numbers larger than 1k
        if (value >= 1e3) {
            var units = ["k", "M", "B", "T"];

            // Divide to get SI Unit engineering style numbers (1e3,1e6,1e9, etc)
            let unit = Math.floor(((value).toFixed(0).length - 1) / 3) * 3
            // Calculate the remainder
            var num = (value / ('1e' + unit)).toFixed(decimal)
            var unitname = units[Math.floor(unit / 3) - 1]

            // output number remainder + unitname
            return num + unitname
        }

        // return formatted original number
        return value
    }

    function US_Chart(Statistic, Color, Label) {
        var Statistic_Change = Statistic + " Change";
        var statBaseline = Statistic_Change;
        var Header;

        var format = {};
        format[Statistic_Change] = {
            label: Statistic_Change,

        };
        format[statBaseline] = {
            label: statBaseline,
            // format: function (n) {
            //     return (n.toFixed(4));
            // }
        };
        format["Down Days"] = {
            label: "Down Days"
        };

        dimension = {};

        dimension["GDP"] = {type: 'measure'};

        dimension["Welfare"] = {type: 'measure'};

        dimension["Income"] = {type: 'measure'};
        dimension["Petrol Product"] = {type: 'measure'};
        dimension["GDP Change"] = {type: 'measure'};

        dimension["Welfare Change"] = {type: 'measure'};

        dimension["Income Change"] = {type: 'measure'};
        dimension["Petrol Product Change"] = {type: 'measure'};
        dimension["Spine"] = {type: 'category'};


        Header = "Percent change to " + Label + " from baseline for Storm: " + stormProbability(myStorm) + " and for " + US_year;

        function calcNatStat() {
            if (typeof datasource !== 'undefined') {
                if (datasource[0].Spine == 'Spine') {
                    l = [datasource[1]['Spine'], datasource[0]['Spine']];
                    data = [datasource[1][Statistic_Change].toFixed(3), datasource[0][Statistic_Change].toFixed(3)]
                } else {
                    l = [datasource[0]['Spine'], datasource[1]['Spine']];
                    data = [datasource[0][Statistic_Change].toFixed(3), datasource[1][Statistic_Change].toFixed(3)]
                }
            } else {
                counter++;
                if (counter <= 10) {
                    setTimeout(function () {
                        calcNatStat();
                    }, 200);
                } else {
                    counter = 0;
                }
            }
        }

        calcNatStat();

        var canvas = document.createElement('canvas');
        canvas.id = "Canvas"
        var ctx = document.getElementById("US_chart_container").appendChild(canvas);
        var myChartLocal = new Chart(canvas, {
            type: 'bar',
            data: {
                // labels: ["Spine"],
                datasets: [{
                    label: [l[0]],
                    //backgroundColor: 'rgba(255, 153, 0, 1)',
                    //borderColor: 'rgba(255, 153, 0, 1)',
                    backgroundColor: 'rgba(200, 200, 200, 1)',
                    borderColor: 'rgba(200, 200, 200, 1)',
                    fill: true,
                    data: [data[0]]


                }, {
                    label: [l[1]],
                    //backgroundColor: 'rgba(54, 162, 235, 1)',
                    //borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(100, 100, 100, 1)',
                    borderColor: 'rgba(100, 100, 100, 1)',
                    fill: true,
                    data: [data[1]]


                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            suggestedMin: -0.09,
                            suggestedMax: 0.03,
                            callback: function (value) {
                                return value.toFixed(2) + "%"
                            }
                        }
                    }]
                },
                tooltips: {
                    mode: 'dataset',
                    displayColors: false,
                    caretPadding: -50,
                    callbacks: {

                        label: function (tooltipItem, data) {
                            var sum = 0;
                            var index;
                            // tooltipItems.forEach(function (tooltipItem) {
                            index = [tooltipItem.datasetIndex];
                            sum = data.datasets[index].data[tooltipItem.index];

                            function direction(value) {
                                if (value > 1) {
                                    return " increase"
                                } else {
                                    return " decrease"
                                }
                            }

                            // });
                            let output = {
                                "GDP": [Statistic_Change + ': ' + sum + '% ', Statistic + ': $' + commarize(datasource[index][Statistic] * 1000000000, 3)],
                                "Income": [Statistic_Change + ': ' + sum + '%  ', Statistic + ': $' + commarize(datasource[index][Statistic], 3)],

                            }
                            if (output[Statistic] == undefined) {
                                return [Statistic_Change + ': ' + sum + '% ']
                            } else {

                                return output[Statistic]
                            }
                        }


                    }

                }
            }
        });

        if (Chart_Statistic == "Petrol Product" && (myStorm == "100" || myStorm == "500")) {
            myChartLocal.config.options.scales.yAxes[0].ticks.suggestedMin = -4;
            myChartLocal.config.options.scales.yAxes[0].ticks.suggestedMax = 6;
            myChartLocal.update();
        }

        myChart = myChartLocal;

        // dom.byId("US_Chart_Header").innerHTML = Header
        return myChart;
    }

    US_Chart_query.ShowBy = (" and (Down_Days =" + US_Down_Days + " or  Down_Days = 0)");


    US_Chart_data(US_Chart_query, spine = true)

// on(Chart_Spine, "click", function () {
//     baseline=false;
//     if (stormProbability(myStorm) == "Ike"  ){
//         US_Chart_query.ShowBy = (" and (Down_Days =" + US_Down_Days + " or  Down_Days = 0)");
//         console.log(US_Chart_query.ShowBy)
//     // }else if (stormProbability(myStorm) == "10" ){
//     //     US_Chart_query.ShowBy = (" and (Down_Days =" + US_Down_Days + " or  Storm = 'BAU)")
//     }else {
//         US_Chart_query.ShowBy = " and Down_Days= " + US_Down_Days
//     }
//     Chart_Color = ("Spine");
//     US_Chart_data(US_Chart_query, true)
//
// });
// on(Chart_DownTime, "click", function () {
//     baseline=false;
//     US_Chart_query.ShowBy = " and Spine= '" + Spine.value + "'";
//
//     Chart_Color = ("Down Days");
//
//     US_Chart_data(US_Chart_query)
//
//
//
// });
//   on(Chart_Both, "click", function () {
//     baseline=false;
//     US_Chart_query.ShowBy = "";
//     Chart_Color = ("Scenario");
//
//     US_Chart_data(US_Chart_query)
//
// });
// on(Chart_Baseline, "click", function(){
//     baseline=true;
//
//     Chart_Color = ("Scenario");
//
//     US_Chart_data(US_Chart_query)
// });

    /************************************************************
     * Button Functions for Each Click.
     ************************************************************/

    on(pgTitle, "click", function () {
        if (tabView == "Local") {
            $('#localDescriptionModal').modal('show');
        } else if (tabView == "National") {
            $('#nationalDescriptionModal').modal('show');
        } else {
        }
    });

//Added Home button
    on(HomeButton, "click", function () {
        view.goTo({
            center: [-94.961833, 29.567433],
            zoom: 9
        });
        watchUtils.when(view, "animation", function (animation) {
            animation.when(function (animation) {
                damage_layer.refresh();
                pink_damage.refresh();
            })
        });
    });
    on(usHomeButton, "click", function () {
        view_US.goTo({
            center: [-99, 39],
            zoom: 3
        });
        watchUtils.when(view, "animation", function (animation) {
            animation.when(function (animation) {
                us_layer.refresh();
            })
        });
    });

    on(Damages, "click", function () {
        if (myView === "Inundation") {
            myView = "Damage";
            setSubLegend();
            /*Damages.value = "True";
            Damages.src = "images/budget.svg";
            Inundation.src = "images/flooded-houseWhite.svg";
            Inundation.value = "False";*/
            if (filterActive) {
                pink_damage.visible = false;
            }
            damage_layer.visible = true;
            damage_layer.renderer = originalRenderer;
            damage_layer.opacity = 1;
            inundation_layer.visible = !inundation_layer.visible;

            document.getElementById("localLegendTitle").innerHTML = "Property Damage";
            document.getElementById("localLegendSubtitle").innerHTML = "Estimated losses by census block group";

            dom.byId("inundation-card").style.display = "none";
            dom.byId("damage-card").style.display = "block";

            legend.layerInfos = [{
                layer: damage_layer,
                title: null,
                label: null,
            }];
            svg_gauge.removeChild(svg_gauge.childNodes[0]);

            $("#legend_GalavestonBay").removeClass("inundationLegendStyle");
        }
    });

    on(Inundation, "click", function () {
        if (myView === "Damage") {
            myView = "Inundation";
            setSubLegend();
            /*Inundation.value = "True";
            Inundation.src = "images/flooded-house.svg";
            Damages.value = "False";
            Damages.src = "images/budgetwhite.svg";*/
            dom.byId("inundation-card").style.display = "block";
            dom.byId("damage-card").style.display = "none";

            inundation_layer.visible = !inundation_layer.visible;

            if (firstRun) {
                originalRenderer = damage_layer.renderer;
                firstRun = false;
            }

            if (filterActive) {
                pink_damage.visible = true;

                pink_damage.opacity = 0.8;
            }
            damage_layer.opacity = 0;
            document.getElementById("localLegendTitle").innerHTML = "Inundation";
            document.getElementById("localLegendSubtitle").innerHTML = "Water depth in feet";

            legend.layerInfos = [{
                layer: inundation_layer,
                title: null,
                label: null,
            }];
            dom.byId("inundation_gauge_container").appendChild(svg_gauge);
            liquid_gauge = loadLiquidFillGauge("inundation_gauge", 0, gauge_config);
            call_query();

            $("#inundation_gauge_container svg").attr("viewBox", "0 0 188 187");
            $("#inundation_gauge_container svg").attr("preserveAspectRatio", "xMinYMid meet");

            $("#legend_GalavestonBay").addClass("inundationLegendStyle");
        }

    });


    on(SpineButton, "click", function () {
        get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);

        if (Spine.value === "True") {
            Spine.value = "False";
            document.getElementById('SpineTxt').style.borderBottom = "2px solid #777777";
            Spine.src = "images/brick-wallWhite.svg";
            setSubLegend();
        } else {
            Spine.value = "True";
            document.getElementById('SpineTxt').style.borderBottom = "2px solid #FF8080";
            Spine.src = "images/brick-wall.svg";
            setSubLegend();
        }
        coastal_spine.renderer = spineRendererInner;
        coastal_spine_outer.renderer = spineRendererOuter;
        coastal_spine.visible = !coastal_spine.visible;
        coastal_spine_outer.visible = !coastal_spine_outer.visible;
        if (filterActive) {
            if (activeFilter.type === "County" || activeFilter.type === "Municipality") {
                Query_definition_Select(activeFilter.type, activeFilter.level);
            } else {
                Query_definition_Select_numeric(activeFilter.type, activeFilter.level);
            }
        } else {
            damage_layer.definitionExpression = Query_definition(SLR, Spine, Year, myStorm);
            //redraw(damage_layer);
            if (damage_layer.loaded) {
                damage_layer.refresh();
            }
            if (pink_damage.loaded) {
                pink_damage.refresh();
            }
            if (us_layer.loaded) {
                setTimeout(function () {
                    us_layer.refresh();
                }, 4000);
            }
        }

        get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);
        //zoomToLayer(damage_layer);


        if (Spine.value == "True" && (stormProbability(myStorm) == "Ike" || stormProbability(myStorm) == "10")) {
            var defn = US_Query_definition("housing", "False", 0, "BAU", state, US_year);
            // dom.byId("downTimeTxt").innerHTML = "0";
            $('#shutdownBtnInnerHTML').addClass('disabled');
            view_US.graphics.add(txtGraphic);
        } else {
            US_Chart_query.ShowBy = " and Spine= '" + Spine.value + "'";
            US_Down_Days = previous_US_Down_Days;
            // dom.byId("downTimeTxt").innerHTML = US_Down_Days;
            $('#shutdownBtnInnerHTML').removeClass('disabled');
            var defn = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
            view_US.graphics.remove(txtGraphic);
        }
        console.log(defn)
        us_layer.forEach(function (sublayer) {

            sublayer.definitionExpression = defn;
        });
    });

    on(SLRMyOnOffSwitchContainer, "click", function () {
        get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);

        if (SLR.value === "True") {
            if (tabView != "National") {
                document.getElementById('SLRMyOnOffSwitchText').style.borderBottom = "2px solid #777777";
                SLR.src = "images/seaWhite.svg";
                SLR.value = "False";
            } else {
                $('#nationalSLRmodal').modal('show');
            }
        } else {
            if (Year === "Present") {
                window.alert("Hurricane storms were not modeled for Sea Level rise without development growth. ");
                return null;
            }
            SLR.value = "True";
            document.getElementById('SLRMyOnOffSwitchText').style.borderBottom = "2px solid #3DC4C4";
            SLR.src = "images/sea.svg";
        }
        if (filterActive) {
            if (activeFilter.type === "County" || activeFilter.type === "Municipality") {
                Query_definition_Select(activeFilter.type, activeFilter.level);
            } else {
                Query_definition_Select_numeric(activeFilter.type, activeFilter.level);
            }
        } else {
            damage_layer.definitionExpression = Query_definition(SLR, Spine, Year, myStorm);
            //redraw(damage_layer);
            if (damage_layer.loaded) {
                damage_layer.refresh();
            }
            if (pink_damage.loaded) {
                pink_damage.refresh();
            }
        }
        get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);
        //zoomToLayer(damage_layer);
    });

    on(Year2018button, "click", function () {
        if (Year2018.value === "False") {
            get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);
            Year = "Present";
            dom.byId("sliderDisplay").style.visibility = "visible";
            US_year = US_year_Slider.value;
            dom.byId("year_label").innerHTML = "Year of Economic Impacts: " + US_year;
            if (US_year == 2017) {
                document.getElementById("USLegendSubtitle").innerHTML = USviewLegendSub2016 + (US_year - 2016) + " year";
            } else {
                document.getElementById("USLegendSubtitle").innerHTML = USviewLegendSub2016 + (US_year - 2016) + " years";
            }
            Year2018.value = "True";
            Year2018.src = "images/Year.svg";
            document.getElementById('Year2018txt').style.borderBottom = "2px solid yellow";

            document.getElementById('Year2080txt').style.borderBottom = "2px solid #777777";
            Year2080.src = "images/YearWhite2080.svg";
            Year2080.value = "False";

            $("#SLRMyOnOffSwitchContainer").removeClass("shown");
            //SLRMyOnOffSwitchContainer.style.display = "none";
            document.getElementById('SLRMyOnOffSwitchText').style.borderBottom = "2px solid #777777";
            SLR.src = "images/seaWhite.svg";
            SLR.value = "False";

            if (filterActive) {
                if (activeFilter.type === "County" || activeFilter.type === "Municipality") {
                    Query_definition_Select(activeFilter.type, activeFilter.level);
                } else {
                    Query_definition_Select_numeric(activeFilter.type, activeFilter.level);
                }
            } else {
                damage_layer.definitionExpression = Query_definition(SLR, Spine, Year, myStorm);
                //redraw(damage_layer);
                if (damage_layer.loaded) {
                    damage_layer.refresh();
                }
                if (pink_damage.loaded) {
                    pink_damage.refresh();
                }
                if (us_layer.loaded) {
                    setTimeout(function () {
                        us_layer.refresh();
                    }, 4000);
                }
            }
            get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);
            //zoomToLayer(damage_layer);
            if (Spine.value == "True" && ['10', 'Ike'].includes(stormProbability(myStorm))) {
                us_layer.forEach(function (sublayer) {
                    sublayer.definitionExpression = US_Query_definition("housing", 'False', 0, "BAU", state, US_year);
                });
            } else {
                us_layer.forEach(function (sublayer) {
                    sublayer.definitionExpression = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
                });
            }


        }
        US_Chart_data(US_Chart_query);
        try {
            document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"));
            US_Chart(Chart_Statistic, Chart_Color, Chart_Label);
        } catch (e) {
            console.log("err")
        }

    });

    on(Year2080button, "click", function () {
        if (Year2080.value === "False") {
            get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);
            Year = "2080";
            US_year = "2080";
            document.getElementById("USLegendSubtitle").innerHTML = USviewLegendSub2080;
            dom.byId("year_label").innerHTML = "Year of Economic Impacts: 2080";
            dom.byId("sliderDisplay").style.visibility = "hidden";

            Year2080.value = "True";
            Year2080.src = "images/Year2080.svg";
            document.getElementById('Year2080txt').style.borderBottom = "2px solid yellow";

            document.getElementById('Year2018txt').style.borderBottom = "2px solid #777777";
            Year2018.src = "images/YearWhite.svg";
            Year2018.value = "False";

            //SLRMyOnOffSwitchContainer.style.display = "block";
            $("#SLRMyOnOffSwitchContainer").addClass("shown");
            if (tabView == "National") {
                SLR.value = "True";
                document.getElementById('SLRMyOnOffSwitchText').style.borderBottom = "2px solid #3DC4C4";
                SLR.src = "images/sea.svg";
            }

            if (filterActive) {
                if (activeFilter.type === "County" || activeFilter.type === "Municipality") {
                    Query_definition_Select(activeFilter.type, activeFilter.level);
                } else {
                    Query_definition_Select_numeric(activeFilter.type, activeFilter.level);
                }
            } else {
                damage_layer.definitionExpression = Query_definition(SLR, Spine, Year, myStorm);
                //redraw(damage_layer);
                if (damage_layer.loaded) {
                    damage_layer.refresh();
                }
                if (pink_damage.loaded) {
                    pink_damage.refresh();
                }
                if (us_layer.loaded) {
                    setTimeout(function () {
                        us_layer.refresh();
                    }, 4000);
                }
            }
            get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);
            //zoomToLayer(damage_layer);
        }
        if (Spine.value == "True" && ['10', 'Ike'].includes(stormProbability(myStorm))) {
            us_layer.forEach(function (sublayer) {
                sublayer.definitionExpression = US_Query_definition("housing", 'False', 0, "BAU", state, 2080);
                console.log(sublayer.definitionExpression)
            });
        } else {
            us_layer.forEach(function (sublayer) {
                sublayer.definitionExpression = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, 2080);
            });
        }
        US_Chart_data(US_Chart_query);
        try {
            document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"));
            US_Chart(Chart_Statistic, Chart_Color, Chart_Label);
        } catch (e) {
            console.log("err")
        }


    });


    /************************************************************
     * US Map Button Functions for Each Click.
     ************************************************************/

    /***********************************************************
     Time Slider
     *********************************************************/
        //Placeholder for TimeSlider function

    let btn_minus, btn_plus, min, max, step, from;
    btn_minus = dom.byId("btn-minus");
    btn_plus = dom.byId("btn-plus");
    min = 1;
    max = 11;
    step = 1;
    from = 1;
    var $range = $(".timeslider")


    on(GDP, "click", function () {

        us_layer.forEach(function (sublayer) {
            console.log(sublayer, sublayer.id==0);
            sublayer.visible = (0 == sublayer.id);
        });
        document.getElementById("USLegendTitle").innerHTML = "Difference in Economic Activity (GDP)";
        //document.getElementById("USLegendSubtitle").innerHTML = "Percent Change";
        
        legend_US.layerInfos = [{
            		layer: us_layer[0],
            		title: null,
            		label: null
        		}];

        Chart_Statistic = "GDP";
        Chart_Label = "GDP";
        document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
        //
        US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

        Chart_Title_Txt = "Economic Activity";
        if (dom.byId("stateTxt").innerHTML == "All") {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for Entire U.S.";
        } else {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for " + dom.byId("stateTxt").innerHTML;
        }

        dom.byId("US_chart_footer").innerHTML = USviewTxtGDP;
        if (us_layer.loaded) {
            setTimeout(function () {
                us_layer.refresh();
            }, 1000);
        }
    });
    on(Welfare, "click", function () {

        us_layer.forEach(function (sublayer) {
            sublayer.visible = (2 == sublayer.id);
        });
        document.getElementById("USLegendTitle").innerHTML = "Welfare change";
        //document.getElementById("USLegendSubtitle").innerHTML = "Percent Change";

        legend_US.layerInfos = [{
            		layer: us_layer[2],
            		title: null,
            		label: null
        		}];

        Chart_Statistic = "Welfare";
        Chart_Label = "Welfare";
        document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
        US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

        dom.byId("US_Chart_Header").innerHTML = "Changes to " + Chart_Statistic + "Change for  " + stormProbability(myStorm) + " Storm";
        if (us_layer.loaded) {
            setTimeout(function () {
                us_layer.refresh();
            }, 1000);
        }

    });
    on(Income, "click", function () {
        us_layer.forEach(function (sublayer) {
            sublayer.visible = (1 == sublayer.id);
        });
        document.getElementById("USLegendTitle").innerHTML = "Difference in Per Capita Income";
        //document.getElementById("USLegendSubtitle").innerHTML = "Percent Change";

        legend_US.layerInfos = [{
            		layer: us_layer[1],
            		title: null,
            		label: null
        		}];

        Chart_Statistic = "Income";
        Chart_Label = "Income";
        document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
        US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

        Chart_Title_Txt = "Per Capita Income";
        if (dom.byId("stateTxt").innerHTML == "All") {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for Entire U.S.";
        } else {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for " + dom.byId("stateTxt").innerHTML;
        }

        dom.byId("US_chart_footer").innerHTML = USviewTxtIncome;
        if (us_layer.loaded) {
            setTimeout(function () {
                us_layer.refresh();
            }, 1000);
        }

    });
    on(Gas_Price, "click", function () {
        us_layer.forEach(function (sublayer) {
            sublayer.visible = (3 == sublayer.id);
        });
        document.getElementById("USLegendTitle").innerHTML = "Difference in Gas Prices";
        //document.getElementById("USLegendSubtitle").innerHTML = "Percent Change";
        
        legend_US.layerInfos = [{
            		layer: us_layer[3],
            		title: null,
            		label: null
        		}];        

        Chart_Statistic = "Petrol Product";
        Chart_Label = "Petrol Product";

        document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
        US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

        Chart_Title_Txt = "Gas Prices";
        if (dom.byId("stateTxt").innerHTML == "All") {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for Entire U.S.";
        } else {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for " + dom.byId("stateTxt").innerHTML;
        }

        dom.byId("US_chart_footer").innerHTML = USviewTxtGas;
        if (us_layer.loaded) {
            setTimeout(function () {
                us_layer.refresh();
            }, 1000);
        }
    });

    on(housing_Price, "click", function () {
        us_layer.forEach(function (sublayer) {
            sublayer.visible = (5 == sublayer.id);
        });
        document.getElementById("USLegendTitle").innerHTML = "Difference in Housing Prices";
        //document.getElementById("USLegendSubtitle").innerHTML = "Percent Change";
        
        legend_US.layerInfos = [{
            		layer: us_layer[5],
            		title: null,
            		label: null
        		}];        

        Chart_Statistic = "Housing Price";
        Chart_Label = "Housing Price";

        document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
        US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

        Chart_Title_Txt = "Housing Prices";
        if (dom.byId("stateTxt").innerHTML == "All") {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for Entire U.S.";
        } else {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for " + dom.byId("stateTxt").innerHTML;
        }

        dom.byId("US_chart_footer").innerHTML = USviewTxtHousing;
        if (us_layer.loaded) {
            setTimeout(function () {
                us_layer.refresh();
            }, 1000);
        }

    });

    on(Insurance_Price, "click", function () {
        us_layer.forEach(function (sublayer) {
            sublayer.visible = (6 == sublayer.id);
        });
        document.getElementById("USLegendTitle").innerHTML = "Difference in Insurance Prices";
        //document.getElementById("USLegendSubtitle").innerHTML = "Percent Change";
        
        legend_US.layerInfos = [{
            		layer: us_layer[6],
            		title: null,
            		label: null
        		}];        

        Chart_Statistic = "Insurance Price";
        Chart_Label = "Insurance Price";

        document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
        US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

        Chart_Title_Txt = "Insurance Prices";
        if (dom.byId("stateTxt").innerHTML == "All") {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for Entire U.S.";
        } else {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for " + dom.byId("stateTxt").innerHTML;
        }

        dom.byId("US_chart_footer").innerHTML = USviewTxtInsurance;
        if (us_layer.loaded) {
            setTimeout(function () {
                us_layer.refresh();
            }, 1000);
        }

    });

    on(IkeButton, "click", function () {
        dom.byId("range-container").style.display = "none";
        myStorm = "0";
        if (filterActive) {
            if (activeFilter.type === "County" || activeFilter.type === "Municipality") {
                Query_definition_Select(activeFilter.type, activeFilter.level);
            } else {
                Query_definition_Select_numeric(activeFilter.type, activeFilter.level);
            }
        } else {
            damage_layer.definitionExpression = Query_definition(SLR, Spine, Year, myStorm);
        }
        // get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, previous_storm);
        get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);

        damageValue = stormValue(myStorm);
        call_query();
        //gauge.refresh(gauge.originalValue, damageValue);


        previous_storm = myStorm;

        US_Chart_data(US_Chart_query);
        try {
            document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"));
            US_Chart(Chart_Statistic, Chart_Color, Chart_Label);
        } catch (e) {
            console.log("err")
        }

        document.getElementById("MinImpactsTxt").style.visibility = "visible";

        if (Spine.value == "True" && stormProbability(myStorm) == "Ike") {
            var spine_query = US_Query_definition("housing", "False", 0, "BAU", state, US_year);
            // dom.byId("downTimeTxt").innerHTML = "0";
            $('#shutdownBtnInnerHTML').addClass('disabled');
            view_US.graphics.add(txtGraphic);
        } else {
            var spine_query = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
            // dom.byId("downTimeTxt").innerHTML = US_Down_Days;
            $('#shutdownBtnInnerHTML').removeClass('disabled');
            view_US.graphics.remove(txtGraphic);
        }

        us_layer.forEach(function (sublayer) {
            sublayer.definitionExpression = spine_query
        });

        if (us_layer.loaded) {
            setTimeout(function () {
                us_layer.refresh();
            }, 4000);
        }

    });

    on(ModelButton, "click", function () {
        dom.byId("range-container").style.display = "block";
        myStorm = previous_model_storm;

        if (stormProbability(myStorm) == "10") {
            document.getElementById("MinImpactsTxt").style.visibility = "visible";
        } else {
            document.getElementById("MinImpactsTxt").style.visibility = "hidden";
        }

        if (filterActive) {
            if (activeFilter.type === "County" || activeFilter.type === "Municipality") {
                Query_definition_Select(activeFilter.type, activeFilter.level);
            } else {
                Query_definition_Select_numeric(activeFilter.type, activeFilter.level);
            }
        } else {
            damage_layer.definitionExpression = Query_definition(SLR, Spine, Year, myStorm);
        }
        // get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, previous_storm);
        get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);

        damageValue = stormValue(myStorm);
        call_query();
        //gauge.refresh(gauge.originalValue, damageValue);

        //var spine_query = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
        US_Chart_data(spine_query);
        try {
            document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"));
            US_Chart(Chart_Statistic, Chart_Color, Chart_Label);
        } catch (e) {
            console.log("err")
        }


        if (Spine.value == "True" && stormProbability(myStorm) == "10") {
            US_Down_Days = 0;
            // dom.byId("downTimeTxt").innerHTML = "0";
            $('#shutdownBtnInnerHTML').addClass('disabled');
            var spine_query = US_Query_definition("housing", "False", 0, "BAU", state, US_year);
            view_US.graphics.add(txtGraphic);
        } else {
            var spine_query = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
            US_Down_Days = previous_US_Down_Days;
            // dom.byId("downTimeTxt").innerHTML = US_Down_Days;
            $('#shutdownBtnInnerHTML').removeClass('disabled');
            view_US.graphics.remove(txtGraphic);
        }

        console.log(spine_query)
        us_layer.forEach(function (sublayer) {
            sublayer.definitionExpression = spine_query
        });
        previous_storm = myStorm;
        if (us_layer.loaded) {
            setTimeout(function () {
                us_layer.refresh();
            }, 4000);
        }
    });

    on(Storm, "change", function () {

        var output = document.getElementById("demo");

        if (Storm.value === "1") {
            output.innerHTML = "Probability in next 30 years: <br>  96% (10-year storm)";

            document.getElementById("myRange").pseudoStyle(":-webkit-slider-thumb", "width", "40px");
            document.getElementById("myRange").pseudoStyle(":-webkit-slider-thumb", "height", "40px");
            document.getElementById("myRange").pseudoStyle(":-moz-range-thumb", "width", "40px");
            document.getElementById("myRange").pseudoStyle(":-moz-range-thumb", "height", "40px");
            document.getElementById("myRange").pseudoStyle(":-ms-thumb", "width", "25px");
            document.getElementById("myRange").pseudoStyle(":-ms-thumb", "height", "25px");

            myStorm = "1";

            document.getElementById("MinImpactsTxt").style.visibility = "visible";

        } else if (Storm.value === "2") {
            output.innerHTML = "Probability in next 30 years:  <br> 26% (100-year storm)";

            document.getElementById("myRange").pseudoStyle(":-webkit-slider-thumb", "width", "75px");
            document.getElementById("myRange").pseudoStyle(":-webkit-slider-thumb", "height", "75px");
            document.getElementById("myRange").pseudoStyle(":-moz-range-thumb", "width", "75px");
            document.getElementById("myRange").pseudoStyle(":-moz-range-thumb", "height", "75px");
            document.getElementById("myRange").pseudoStyle(":-ms-thumb", "width", "25px");
            document.getElementById("myRange").pseudoStyle(":-ms-thumb", "height", "25px");

            myStorm = "2";
            document.getElementById("MinImpactsTxt").style.visibility = "hidden";

        } else if (Storm.value === "3") {
            output.innerHTML = "Probability in next 30 years: <br>  6% (500-year storm)";
            document.getElementById("myRange").pseudoStyle(":-webkit-slider-thumb", "width", "100px");
            document.getElementById("myRange").pseudoStyle(":-webkit-slider-thumb", "height", "100px");
            document.getElementById("myRange").pseudoStyle(":-moz-range-thumb", "width", "100px");
            document.getElementById("myRange").pseudoStyle(":-moz-range-thumb", "height", "100px");
            document.getElementById("myRange").pseudoStyle(":-ms-thumb", "width", "25px");
            document.getElementById("myRange").pseudoStyle(":-ms-thumb", "height", "25px");

            myStorm = "3";
            document.getElementById("MinImpactsTxt").style.visibility = "hidden";
        }


        if (filterActive) {
            if (activeFilter.type === "County" || activeFilter.type === "Municipality") {
                Query_definition_Select(activeFilter.type, activeFilter.level);
            } else {
                Query_definition_Select_numeric(activeFilter.type, activeFilter.level);
            }
        } else {
            damage_layer.definitionExpression = Query_definition(SLR, Spine, Year, myStorm);
        }
        // get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, previous_storm);
        get_inudationLayer(inundation_layer, SLR.value, Spine.value, Year, myStorm);

        /*Year.oninput = function () {
            output.innerHTML = this.value;
        };*/
        damageValue = stormValue(myStorm);
        call_query();
        //gauge.refresh(gauge.originalValue, damageValue);
        console.log(Query_definition(SLR, Spine, Year, myStorm));
//        zoomToLayer(damage_layer);
        previous_storm = myStorm;
        previous_model_storm = myStorm;
        //var spine_query = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
        US_Chart_data(spine_query);
        try {
            document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"));
            US_Chart(Chart_Statistic, Chart_Color, Chart_Label);
        } catch (e) {
            console.log("err")
        }


        if (Spine.value == "True" && stormProbability(myStorm) == "10") {
            US_Down_Days = 0;
            // dom.byId("downTimeTxt").innerHTML = "0";
            $('#shutdownBtnInnerHTML').addClass('disabled');
            var spine_query = US_Query_definition("housing", "False", 0, "BAU", state, US_year);
            view_US.graphics.add(txtGraphic);
        } else {
            var spine_query = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
            US_Down_Days = previous_US_Down_Days;
            // dom.byId("downTimeTxt").innerHTML = US_Down_Days;
            $('#shutdownBtnInnerHTML').removeClass('disabled');
            view_US.graphics.remove(txtGraphic);
        }

        console.log(spine_query)
        us_layer.forEach(function (sublayer) {
            sublayer.definitionExpression = spine_query
        });
        if (us_layer.loaded) {
            setTimeout(function () {
                us_layer.refresh();
            }, 4000);
        }
    });
    on(US_year_Slider, "change", function () {
        US_year = US_year_Slider.value;
        if (US_year == 2017) {
            document.getElementById("USLegendSubtitle").innerHTML = USviewLegendSub2016 + (US_year - 2016) + " year";
        } else {
            document.getElementById("USLegendSubtitle").innerHTML = USviewLegendSub2016 + (US_year - 2016) + " years";
        }

        dom.byId("year_label").innerHTML = "Year of Economic Impacts: " + US_year;
        us_layer.forEach(function (sublayer) {
            console.log(sublayer);
        });

        if (Spine.value == "True" && (stormProbability(myStorm) == "Ike" || stormProbability(myStorm) == "10")) {
            var spine_query = US_Query_definition("housing", "False", 0, "BAU", state, US_year);

        } else {
            var spine_query = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
        }

        console.log(spine_query);
        US_Chart_data(spine_query);
        document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
        US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

        us_layer.forEach(function (sublayer) {
            sublayer.definitionExpression = spine_query;
        });
        if (us_layer.loaded) {
            setTimeout(function () {
                us_layer.refresh();
            }, 4000);
        }

    });
    on(dom.byId("btnBack"), "click", function () {
        if (US_year_Slider.value > 2016) {

            US_year_Slider.value--;
            US_year = US_year_Slider.value;
            if (US_year == 2017) {
                document.getElementById("USLegendSubtitle").innerHTML = USviewLegendSub2016 + (US_year - 2016) + " year";
            } else {
                document.getElementById("USLegendSubtitle").innerHTML = USviewLegendSub2016 + (US_year - 2016) + " years";
            }

            dom.byId("year_label").innerHTML = "Year of Economic Impacts: " + US_year;

            if (Spine.value == "True" && (stormProbability(myStorm) == "Ike" || stormProbability(myStorm) == "10")) {
                var spine_query = US_Query_definition("housing", "False", 0, "BAU", state, US_year);
            } else {
                var spine_query = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
            }

            US_Chart_data(spine_query);
            document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
            US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

            us_layer.forEach(function (sublayer) {
                sublayer.definitionExpression = spine_query;
            });
            if (us_layer.loaded) {
                setTimeout(function () {
                    us_layer.refresh();
                }, 4000);
            }
        }


    });
    on(dom.byId("btnForward"), "click", function () {
        if (US_year_Slider.value < 2066) {
            US_year_Slider.value++;
            US_year = US_year_Slider.value;
            if (US_year == 2017) {
                document.getElementById("USLegendSubtitle").innerHTML = USviewLegendSub2016 + (US_year - 2016) + " year";
            } else {
                document.getElementById("USLegendSubtitle").innerHTML = USviewLegendSub2016 + (US_year - 2016) + " years";
            }

            dom.byId("year_label").innerHTML = "Year of Economic Impacts: " + US_year;

            if (Spine.value == "True" && (stormProbability(myStorm) == "Ike" || stormProbability(myStorm) == "10")) {
                var spine_query = US_Query_definition("housing", "False", 0, "BAU", state, US_year);
            } else {
                var spine_query = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
            }

            US_Chart_data(spine_query);
            document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
            US_Chart(Chart_Statistic, Chart_Color, Chart_Label);
            console.log(us_layer)
            us_layer.forEach(function (sublayer) {
                sublayer.definitionExpression = spine_query;
            });
            if (us_layer.loaded) {
                setTimeout(function () {
                    us_layer.refresh();
                }, 4000);
            }

        }


    });


    /************************************************************
     * Query Function
     ************************************************************/
//set up to call queries instead of waiting for layer to update.

    function call_query() {
        var county_list = [];
        var city_list = [];
        damage_layer.queryFeatures({
            geometry: view.extent,
            returnGeometry: true,

            spatialRelationship: "intersects",
            where: damage_layer.definitionExpression,
            outFields: ["damages", 'County', 'Municipality', 'Mean_Surge', 'Inundation_Count']
        }).then(function (results) {
            let sum_damages = 0;
            let sum_structures = 0;
            let mean_inundation = 0;
            let num = 0;
            for (i = 0; i < results.features.length; i++) {
                var result = results.features[i];
                // console.log("",result.attributes)
                sum_damages += result.attributes.damages;
                mean_inundation += result.attributes.Mean_Surge;
                sum_structures += result.attributes.Inundation_Count;
                num += 1;
                county_list.push(result.attributes.County);
                city_list.push(result.attributes.Municipality);

            }
            if (updateFilterList) {
                switch (list.innerHTML) {
                    case "County:":
                        var numberOfListItems = county_list.unique().length;
                        for (var i = 0; i < numberOfListItems; ++i) {
                            dom_id = county_list.unique()[i];
                            if (county_list.unique()[i] == null) {
                                continue
                            }

                            var listItem = document.createElement("button");
                            listItem.innerHTML = dom_id;
                            listItem.classList.add("dropdown-item");
                            listItem.id = dom_id;
                            dom.byId("ExtraDropDownList").appendChild(listItem);
                            var newList = dom.byId(dom_id);

                            newList.addEventListener("click", function () {
                                console.log(this.id);
                                Query_definition_Select("County", this.id);
                                document.getElementById("activeFilterText").innerHTML = this.id;
                                document.getElementById("active_filter").style.visibility = "visible";
                                filterActive = true;
                                activeFilter.type = "County";
                                activeFilter.level = this.id;
                                if (myView == "Damage") {
                                    damage_layer.opacity = 1;
                                } else {
                                    damage_layer.opacity = 0;
                                }
                                setSubLegend();
                            });
                        }
                        updateFilterList = false;
                        break;
                    case "City:":
                        city_list = city_list.unique().sort();
                        var numberOfListItems = city_list.length;
                        console.log(city_list);
                        for (var i = 0; i < numberOfListItems; ++i) {
                            dom_id = city_list.unique()[i];
                            if (dom_id == null) {
                                continue
                            }

                            var listItem = document.createElement("button");
                            listItem.innerHTML = dom_id;
                            listItem.classList.add("dropdown-item");
                            listItem.id = dom_id;
                            dom.byId("ExtraDropDownList").appendChild(listItem);
                            var newList = dom.byId(dom_id);

                            newList.addEventListener("click", function () {
                                console.log(this.id);
                                Query_definition_Select("Municipality", this.id);
                                document.getElementById("activeFilterText").innerHTML = this.id;
                                document.getElementById("active_filter").style.visibility = "visible";
                                filterActive = true;
                                activeFilter.type = "Municipality";
                                activeFilter.level = this.id;
                                if (myView == "Damage") {
                                    damage_layer.opacity = 1;
                                } else {
                                    damage_layer.opacity = 0;
                                }
                                setSubLegend();
                            });
                        }
                        updateFilterList = false;
                        break;
                    default:
                        break;
                }
            }
            if (isNaN(mean_inundation)) {
                console.log(mean_inundation);
                mean_inundation = 0
            }
            mean_inundation /= num;
            // console.log("sum_damages", sum_damages, "damageValue", damageValue);
            // console.log("Inudation:", mean_inundation, "Structures Flooded:", sum_structures);
            dom.byId("liquid_gauge_subtitle").innerHTML = "Structures flooded: " + sum_structures.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (filterActive) {
                dom.byId("depthCalcFilteredTxt").style.display = "inline";
            } else {
                dom.byId("depthCalcFilteredTxt").style.display = "none";
            }

            if (myView === "Inundation") {
                if (isNaN(sum_structures)) {
                    sum_structures = 0;
                    mean_inundation = 0;
                }
                liquid_gauge.update(mean_inundation)
            }
            if (isNaN(sum_damages)) {
                sum_damages = 0
            }

            gauge.refresh(sum_damages, damageValue);
            //redraw(damage_layer);
            if (damage_layer.loaded) {
                damage_layer.refresh();
            }
            if (pink_damage.loaded) {
                pink_damage.refresh();
            }

        }).catch(function (e) {
            console.error("query failed: ", e);
        });

    }

// call_query();

    function setQueryListener() {
        view.whenLayerView(damage_layer).then(function (layerView) {
            layerView.watch("updating", function (value) {
                county_list = [];
                city_list = [];
                if (!value) { // wait for the layer view to finish updating
                    setTimeout(function () {
                        if (view.stationary) {
                            // query all the features available for drawing.
                            console.log("done updating!");
                            damage_layer.queryFeatures({
                                geometry: view.extent,
                                returnGeometry: true,

                                spatialRelationship: "intersects",
                                where: damage_layer.definitionExpression,
                                outFields: ["damages", 'County', 'Municipality', 'Mean_Surge', 'Inundation_Count']
                            }).then(function (results) {
                                let sum_damages = 0;
                                let sum_structures = 0;
                                let mean_inundation = 0;
                                let num = 0;
                                for (var i = 0; i < results.features.length; i++) {
                                    var result = results.features[i];
                                    // console.log("",result.attributes)
                                    county_list.push(result.attributes.County);
                                    city_list.push(result.attributes.Municipality);
                                    sum_damages += result.attributes.damages;
                                    mean_inundation += result.attributes.Mean_Surge;
                                    sum_structures += result.attributes.Inundation_Count;
                                    num += 1;

                                }

                                mean_inundation /= num;
                                if (mean_inundation > 0) {
                                    mean_inundation = mean_inundation
                                } else {
                                    mean_inundation = 0
                                }


                                console.log("Inudation:", mean_inundation, "Structures Flooded:", sum_structures);
                                dom.byId("liquid_gauge_subtitle").innerHTML = "Structures flooded: " + sum_structures.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                if (filterActive) {
                                    dom.byId("depthCalcFilteredTxt").style.display = "inline";
                                } else {
                                    dom.byId("depthCalcFilteredTxt").style.display = "none";
                                }
                                if (myView === "Inundation") {
                                    if (isNaN(sum_structures)) {
                                        sum_structures = 0
                                    }
                                    liquid_gauge.update(mean_inundation)
                                }
                                if (isNaN(sum_damages)) {
                                    sum_damages = 0
                                }
                                gauge.refresh(sum_damages, damageValue);

                            }).catch(function (e) {
                                console.error("query failed: ", e);
                            });

                        }
                    }, 1000);
                }

            });

        });
    }


    setQueryListener();

    var county_list = [];
    var city_list = [];



    /************************************************************
     * Returns an Unique Values from Array
     ************************************************************/

    Array.prototype.unique = function () {
        return this.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
    };


    /************************************************************
     * Function that returns which inundation sub layer should be turned on/off
     ************************************************************/

    function get_inudationLayer(layer, SLR, Spine, Year, Storm) {
        var sublayer = layer.findSublayerById(parseInt(id));
        var id;


        if (SLR === "False") {
            if (Spine === "True") {
                if (Storm == 1) {
                    id = 0;
                } else if (Storm == 2) {
                    id = 1;
                } else if (Storm == 0) {
                    id = (2);
                } else if (Storm == 3) {
                    id = (3);
                }
            } else if (Spine === "False") {
                if (Storm == 1) {
                    id = (4);
                } else if (Storm == 2) {
                    id = (5);
                } else if (Storm == 0) {
                    id = (6);
                } else if (Storm == 3) {
                    id = (7);
                }
            }
        } else if (SLR === "True") {
            if (Spine === "False") {
                if (Storm == 1) {
                    id = 12;
                } else if (Storm == 2) {
                    id = 13;
                } else if (Storm == 0) {
                    id = 14;
                } else if (Storm == 3) {
                    id = 15;
                }
            } else if (Spine === "True") {
                if (Storm == 1) {
                    id = 8;
                } else if (Storm == 2) {
                    id = 9;
                } else if (Storm == 0) {
                    id = 10;
                } else if (Storm == 3) {
                    id = 11;
                }
            }
        }
        /************************************************************
         * Storm Probability Function Returns Slider Value as Storm Probabilty
         ************************************************************/



        inundation_layer.sublayers.items.forEach(function (sublayer) {

            sublayer.visible = false;
        })


        ;
        var inun_l = inundation_layer.findSublayerById(parseInt(id));

        inun_l.visible = !inun_l.visible;
    }

    /***************************
     *Gauge Objects
     *
     ****************************/
        //Damage Gauge

    var gauge = new JustGage({
            id: "gauge",
            value: 0,
            min: 0,
            max: damageValue,
            //title: "Inundation Damages",
            humanFriendly: true,
            humanFriendlyDecimal: 2,
            startAnimationTime: 500,
            startAnimationType: ">",
            refreshAnimationTime: 1000,
//        refreshAnimationType: "bounce",
            counter: true,
            gaugeColor: "#ececec",
            levelColors: ["#ffb247"],
        });

    $("#gauge svg").attr("viewBox", "0 0 244 188");
    $("#gauge svg").attr("preserveAspectRatio", "xMidYMid meet");

    /***************************
     *Dropdowns for queyrring by Spatial Boundaries
     * *
     *
     *
     ****************************/


    /*on(damage_dropdown, "click", function () {

        if (damage_dropdown.classList.contains('show')) {
            damage_dropdown.classList.remove('show')
        }
        else {
            damage_dropdown.classList.add('show');
            dom.byId("ExtraDropDown").classList.remove('show')
        }
    });*/

    on(clear_query, "click", function () {
        if (filterActive === true) {
            removeFilters();
        }
    });

    on(county_query, "click", function () {
        removeFilters();
        if (dom.byId("ExtraDropDownList").classList.contains('columns')) {
            dom.byId("ExtraDropDownList").classList.remove('columns');
        }
        while (dom.byId("ExtraDropDownList").firstChild) {
            dom.byId("ExtraDropDownList").removeChild(dom.byId("ExtraDropDownList").firstChild);
        }
        //var list = dom.byId("ExtraDropdownButton");
        list.innerHTML = "County:";
        list.style.visibility = "visible";
        updateFilterList = true;
        zoomToLayer(damage_layer);
        //list.style.visibility = "visible";

        if (dom.byId("ExtraDropDown").classList.contains('show')) {
            //dom.byId("ExtraDropDown").classList.remove('show')
        } else {
            //dom.byId("ExtraDropDown").classList.add('show')
        }
    });

    on(city_query, "click", function () {
        removeFilters();
        if (!dom.byId("ExtraDropDownList").classList.contains('columns')) {
            dom.byId("ExtraDropDownList").classList.add('columns');
        }
        while (dom.byId("ExtraDropDownList").firstChild) {
            dom.byId("ExtraDropDownList").removeChild(dom.byId("ExtraDropDownList").firstChild);
        }
        //var list = dom.byId("ExtraDropdownButton");
        list.innerHTML = "City:";
        list.style.visibility = "visible";
        updateFilterList = true;
        zoomToLayer(damage_layer);
        //list.style.visibility = "visible";


        if (dom.byId("ExtraDropDown").classList.contains('show')) {
            //dom.byId("ExtraDropDown").classList.remove('show')
        } else {
            //dom.byId("ExtraDropDown").classList.add('show')
        }

    });
    on(SVI_query, "click", function () {
        removeFilters();
        if (dom.byId("ExtraDropDownList").classList.contains('columns')) {
            dom.byId("ExtraDropDownList").classList.remove('columns');
        }
        while (dom.byId("ExtraDropDownList").firstChild) {
            dom.byId("ExtraDropDownList").removeChild(dom.byId("ExtraDropDownList").firstChild);
        }
        //var list = dom.byId("ExtraDropdownButton");
        list.innerHTML = "SVI Level:";
        list.style.visibility = "visible";
        var numberOfListItems = ['Very High', '≥ High', '≥ Medium', '≥ Low'];
        for (var i = 0; i < numberOfListItems.length; ++i) {
            dom_id = numberOfListItems[i];
            if (dom_id == null) {
                continue
            }

            var listItem = document.createElement("button");
            listItem.innerHTML = dom_id;
            listItem.classList.add("dropdown-item");
            listItem.id = dom_id;
            dom.byId("ExtraDropDownList").appendChild(listItem);
            var newList = dom.byId(dom_id);

            newList.addEventListener("click", function () {

                if (this.id == 'Very High') {
                    value = 0.8
                } else if (this.id == '≥ High') {
                    value = 0.6
                } else if (this.id == '≥ Medium') {
                    value = 0.4
                } else if (this.id == '≥ Low') {
                    value = 0.2
                }
                activeFilter.type = "SVI";
                activeFilter.level = value;
                Query_definition_Select_numeric("SVI", value);
                document.getElementById("activeFilterText").innerHTML = this.id;
                document.getElementById("active_filter").style.visibility = "visible";
                filterActive = true;
                if (myView == "Damage") {
                    damage_layer.opacity = 1;
                } else {
                    damage_layer.opacity = 0;
                }
                setSubLegend();
            });
        }

        if (dom.byId("ExtraDropDown").classList.contains('show')) {
            //dom.byId("ExtraDropDown").classList.remove('show')
        } else {
            //dom.byId("ExtraDropDown").classList.add('show')
        }


    });
    on(population_query, "click", function () {
        removeFilters();
        if (dom.byId("ExtraDropDownList").classList.contains('columns')) {
            dom.byId("ExtraDropDownList").classList.remove('columns');
        }
        while (dom.byId("ExtraDropDownList").firstChild) {
            dom.byId("ExtraDropDownList").removeChild(dom.byId("ExtraDropDownList").firstChild);
        }
        //var list = dom.byId("ExtraDropdownButton");
        list.innerHTML = "Density:";
        list.style.visibility = "visible";
        var numberOfListItems = ['≥ 1200 per sq mi', '≥ 700 per sq mi', '≥ 400 per sq mi', '≥ 145 per sq mi'];
        for (var i = 0; i < numberOfListItems.length; ++i) {
            dom_id = numberOfListItems[i];
            if (dom_id == null) {
                continue
            }

            var listItem = document.createElement("button");
            listItem.innerHTML = dom_id;
            listItem.classList.add("dropdown-item");
            listItem.id = dom_id;
            dom.byId("ExtraDropDownList").appendChild(listItem);
            var newList = dom.byId(dom_id);

            newList.addEventListener("click", function () {

                if (this.id == '≥ 1200 per sq mi') {
                    value = 1200
                } else if (this.id == '≥ 700 per sq mi') {
                    value = 700
                } else if (this.id == '≥ 400 per sq mi') {
                    value = 400
                } else if (this.id == '≥ 145 per sq mi') {
                    value = 145
                }

                activeFilter.type = "Pop_Density";
                activeFilter.level = value;
                Query_definition_Select_numeric("Pop_Density", value);
                document.getElementById("activeFilterText").innerHTML = this.id;
                document.getElementById("active_filter").style.visibility = "visible";
                filterActive = true;
                if (myView == "Damage") {
                    damage_layer.opacity = 1;
                } else {
                    damage_layer.opacity = 0;
                }
                setSubLegend();
            });
        }

        if (dom.byId("ExtraDropDown").classList.contains('show')) {
            //dom.byId("ExtraDropDown").classList.remove('show')
        } else {
            //dom.byId("ExtraDropDown").classList.add('show')
        }


    });

    var stateList = [
        {
            "name": "Alabama",
            "abbreviation": "AL"
        },
        {
            "name": "Alaska",
            "abbreviation": "AK"
        },
        {
            "name": "Arizona",
            "abbreviation": "AZ"
        },
        {
            "name": "Arkansas",
            "abbreviation": "AR"
        },
        {
            "name": "California",
            "abbreviation": "CA"
        },
        {
            "name": "Colorado",
            "abbreviation": "CO"
        },
        {
            "name": "Connecticut",
            "abbreviation": "CT"
        },
        {
            "name": "Delaware",
            "abbreviation": "DE"
        },
        {
            "name": "District Of Columbia",
            "abbreviation": "DC"
        },
        {
            "name": "Florida",
            "abbreviation": "FL"
        },
        {
            "name": "Georgia",
            "abbreviation": "GA"
        },
        {
            "name": "Hawaii",
            "abbreviation": "HI"
        },
        {
            "name": "Idaho",
            "abbreviation": "ID"
        },
        {
            "name": "Illinois",
            "abbreviation": "IL"
        },
        {
            "name": "Indiana",
            "abbreviation": "IN"
        },
        {
            "name": "Iowa",
            "abbreviation": "IA"
        },
        {
            "name": "Kansas",
            "abbreviation": "KS"
        },
        {
            "name": "Kentucky",
            "abbreviation": "KY"
        },
        {
            "name": "Louisiana",
            "abbreviation": "LA"
        },
        {
            "name": "Maine",
            "abbreviation": "ME"
        },
        {
            "name": "Maryland",
            "abbreviation": "MD"
        },
        {
            "name": "Massachusetts",
            "abbreviation": "MA"
        },
        {
            "name": "Michigan",
            "abbreviation": "MI"
        },
        {
            "name": "Minnesota",
            "abbreviation": "MN"
        },
        {
            "name": "Mississippi",
            "abbreviation": "MS"
        },
        {
            "name": "Missouri",
            "abbreviation": "MO"
        },
        {
            "name": "Montana",
            "abbreviation": "MT"
        },
        {
            "name": "Nebraska",
            "abbreviation": "NE"
        },
        {
            "name": "Nevada",
            "abbreviation": "NV"
        },
        {
            "name": "New Hampshire",
            "abbreviation": "NH"
        },
        {
            "name": "New Jersey",
            "abbreviation": "NJ"
        },
        {
            "name": "New Mexico",
            "abbreviation": "NM"
        },
        {
            "name": "New York",
            "abbreviation": "NY"
        },
        {
            "name": "North Carolina",
            "abbreviation": "NC"
        },
        {
            "name": "North Dakota",
            "abbreviation": "ND"
        },
        {
            "name": "Ohio",
            "abbreviation": "OH"
        },
        {
            "name": "Oklahoma",
            "abbreviation": "OK"
        },
        {
            "name": "Oregon",
            "abbreviation": "OR"
        },
        {
            "name": "Pennsylvania",
            "abbreviation": "PA"
        },
        {
            "name": "Puerto Rico",
            "abbreviation": "PR"
        },
        {
            "name": "Rhode Island",
            "abbreviation": "RI"
        },
        {
            "name": "South Carolina",
            "abbreviation": "SC"
        },
        {
            "name": "South Dakota",
            "abbreviation": "SD"
        },
        {
            "name": "Tennessee",
            "abbreviation": "TN"
        },
        {
            "name": "Texas",
            "abbreviation": "TX"
        },
        {
            "name": "Utah",
            "abbreviation": "UT"
        },
        {
            "name": "Vermont",
            "abbreviation": "VT"
        },
        {
            "name": "Virginia",
            "abbreviation": "VA"
        },
        {
            "name": "Washington",
            "abbreviation": "WA"
        },
        {
            "name": "West Virginia",
            "abbreviation": "WV"
        },
        {
            "name": "Wisconsin",
            "abbreviation": "WI"
        },
        {
            "name": "Wyoming",
            "abbreviation": "WY"
        }
    ];
    on(state_query, "click", function () {
        while (dom.byId("StateDropDownList").firstChild) {
            dom.byId("StateDropDownList").removeChild(dom.byId("StateDropDownList").firstChild);
        }

        var allStates = document.createElement("button");
        allStates.innerHTML = "All";
        allStates.classList.add("dropdown-item");
        allStates.id = "allStates";

        var divider = document.createElement("div");
        divider.classList.add("dropdown-divider");

        dom.byId("StateDropDownList").appendChild(allStates);
        dom.byId("StateDropDownList").appendChild(divider);

        for (var i = 0; i < stateList.length; ++i) {
            dom_id = stateList[i].name;

            if (dom_id == null) {
                continue
            }

            var listItem = document.createElement("button");
            listItem.innerHTML = dom_id;
            listItem.classList.add("dropdown-item");
            listItem.id = dom_id;
            dom.byId("StateDropDownList").appendChild(listItem);
        }
        // US_Chart_data(US_Chart_query);
        // document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
        // US_Chart(Chart_Statistic, Chart_Color, Chart_Label);
    });
    /***************************
     *STate Query List
     *
     ****************************/

    var newList = dom.byId("StateDropDownList");
    on(newList, "click", function (e) {
        var abb;
        if (e.srcElement.id === "allStates") {
            state = null;
            dom.byId("stateTxt").innerHTML = "All";
        } else {
            state = e.srcElement.innerHTML.toUpperCase();
            dom.byId("stateTxt").innerHTML = e.srcElement.innerHTML;
        }
        for (var i = 0; i < stateList.length; ++i) {

            if (stateList[i].name == e.srcElement.innerHTML) {

                abb = stateList[i].abbreviation
            }
        }
        us_layer.forEach(function (sublayer) {
            sublayer.definitionExpression = US_Query_definition(US_Damage_Type, Spine.value, US_Down_Days, stormProbability(myStorm), state, US_year);
        });

        let US_Data = [];

        var queryTask = new QueryTask("https://services1.arcgis.com/qr14biwnHA6Vis6l/arcgis/rest/services/GLO_Tables/FeatureServer/1");
        var query;
        var query_BAU;
        if (state) {
            US_Chart_query.State = "and state ='" + abb + "'"

        } else {
            US_Chart_query.State = " "

        }
        // Chart_Color = ("Scenario");


        US_Chart_data(US_Chart_query);
        // document.getElementById("US_chart_container").removeChild(document.getElementById("Canvas"))
        // US_Chart(Chart_Statistic, Chart_Color, Chart_Label);

        if (dom.byId("stateTxt").innerHTML == "All") {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for Entire U.S.";
        } else {
            dom.byId("US_Chart_Header").innerHTML = "Difference in " + Chart_Title_Txt + " from No-Storm Scenario for " + dom.byId("stateTxt").innerHTML;
        }

    });


    function Query_definition_Select_numeric(name, value) {
        if (inundation_layer.visible == true) {
            pink_damage.visible = true;

            pink_damage.opacity = 0.8;
        }

        if (activeFilter.type == "SVI") {
            damage_layer.definitionExpression = "year = '" + Year + "' AND spine = '" + Spine.value + "' AND storm = '" +
                stormProbability(myStorm) + "' AND slr = '" + SLR.value + "' AND " + name + ">= " + value;
            pink_damage.definitionExpression = "year = '" + Year + "' AND spine = '" + Spine.value + "' AND storm = '" +
                stormProbability(myStorm) + "' AND slr = '" + SLR.value + "' AND " + name + ">= " + value;
            /* CODE TO QUERY RANGE FOR SVI -- NOT CURRENTLY FUNCTIONAL
            value2 = value+0.2;
            damage_layer.definitionExpression = "year = '" + Year + "' AND spine = '" + Spine.value + "' AND storm = '" +
                stormProbability(myStorm) + "' AND slr = '" + SLR.value + "' AND (" + name + "BETWEEN" + value + "' AND " + value2 + ")";
            */
        } else {
            damage_layer.definitionExpression = "year = '" + Year + "' AND spine = '" + Spine.value + "' AND storm = '" +
                stormProbability(myStorm) + "' AND slr = '" + SLR.value + "' AND " + name + ">= " + value;
            pink_damage.definitionExpression = "year = '" + Year + "' AND spine = '" + Spine.value + "' AND storm = '" +
                stormProbability(myStorm) + "' AND slr = '" + SLR.value + "' AND " + name + ">= " + value;
        }

        if (damage_layer.loaded) {
            damage_layer.refresh();
        }
        if (pink_damage.loaded) {
            pink_damage.refresh();
        }
        if (dom.byId("ExtraDropDown").classList.contains('show')) {
            //dom.byId("ExtraDropDown").classList.remove('show')
            //dom.byId("ExtraDropdownButton").style.display = "none";
        } else {
            //dom.byId("ExtraDropDown").classList.add('show')
        }
    }

    function Query_definition_Select(name, value) {
        if (inundation_layer.visible == true) {
            pink_damage.visible = true;

            pink_damage.opacity = 0.8;
        }

        pink_damage.opacity = 0.8;
        console.log("year = '" + Year + "' AND spine = '" + Spine.value + "' AND storm = '" +
            stormProbability(myStorm) + "' AND slr = '" + SLR.value + "' AND " + name + "= '" + value + "'")
        damage_layer.definitionExpression = "year = '" + Year + "' AND spine = '" + Spine.value + "' AND storm = '" +
            stormProbability(myStorm) + "' AND slr = '" + SLR.value + "' AND " + name + "= '" + value + "'";
        pink_damage.definitionExpression = "year = '" + Year + "' AND spine = '" + Spine.value + "' AND storm = '" +
            stormProbability(myStorm) + "' AND slr = '" + SLR.value + "' AND " + name + "= '" + value + "'";
        // view.goTo(damage_layer.fullExtent);
        zoomToLayer(damage_layer);
        watchUtils.when(view, "animation", function (animation) {
            animation.when(function (animation) {
                damage_layer.refresh();
                pink_damage.refresh();
            })
        });
        if (dom.byId("ExtraDropDown").classList.contains('show')) {
            //dom.byId("ExtraDropDown").classList.remove('show')
            //dom.byId("ExtraDropdownButton").style.display = "none";
            //console.log(dom.byId("ExtraDropdownButton").style.display)
        } else {
            //dom.byId("ExtraDropDown").classList.add('show')

        }


    }

    function zoomToLayer(layer) {
        return layer.queryExtent()
            .then(function (response) {
                view.goTo(response.extent);
                var zoomedOut = false;
                watchUtils.when(view, "animation", function (animation) {
                    animation.when(function (animation) {
                        while (zoomedOut == false) {
                            if (view.zoom > 10) {
                                view.goTo({
                                    center: view.center,
                                    zoom: view.zoom - 1
                                });
                            }
                            call_query();
                            zoomedOut = true;
                        }
                    })
                });
            });
    }

    function redraw(layer) {
        return layer.queryExtent()
            .then(function () {
                setTimeout(function () {
                    view.goTo(view.extent);
                }, 1000);
            });
    }

    function removeFilters() {
        list.style.visibility = "hidden";
        document.getElementById("active_filter").style.visibility = "hidden";
        damage_layer.definitionExpression = Query_definition(SLR, Spine, Year, myStorm);
        pink_damage.definitionExpression = damage_layer.definitionExpression;
        pink_damage.visible = false;
        //redraw(damage_layer);
        if (damage_layer.loaded) {
            damage_layer.refresh();
        }
        filterActive = false;
        if (myView == "Damage") {
            damage_layer.opacity = 1;
        } else {
            damage_layer.opacity = 0;
        }
        setSubLegend();
    }

})
;

$(document).ready(function () {
    $('#localDescriptionModal').modal('show');
});