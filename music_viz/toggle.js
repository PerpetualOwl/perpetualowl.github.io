var display = "artist";
var selection = "default";
const height = 900;
const width = 900;
var brush;
var svg;
var dot;
var text;
const topartists = ["Adele", "Drake", "Lady Gaga", "Taylor Swift", "Beyoncé", "Other"];
const topgenres = ["Pop", "R&B", "Hip-Hop", "Country", "Rap", "Other"];

function updateMenu() {
    $(".btn-hover").remove();
    if (display == "artist") {
        for (let i = 0; i < topartists.length; i++) {
            $("#hover-menu").append(`<div type="button" class="btn btn-secondary btn-hover" onmouseover="hover('${topartists[i]}')">${topartists[i]}</div>`);
        }
    } else if (display == "genre") {
        for (let i = 0; i < topgenres.length; i++) {
            $("#hover-menu").append(`<div type="button" class="btn btn-secondary btn-hover" onmouseover="hover('${topgenres[i]}')">${topgenres[i]}</div>`);
        }
    }
}

function hover(object) {
    selection = object;
    svg.selectAll().call(updateBrushed);
}


function updateBrushed({ selection }) {
    let value = [];
    dot.style("stroke", function (d) { return _dotcolor(d) });
    dot.style("z-index", function (d) { return _zindex(d) });
    svg.property("value", value).dispatch("input");
}

function changeColor() {
    console.log("toggle");
    if (display == "artist") {
        display = "genre";
    } else if (display == "genre") {
        display = "artist";
    }
    svg.selectAll().call(updateBrushed);
    updateMenu();
}

function _dotcolor(d) {
    var ind = -1;
    if (display == "artist") {
        ind = topartists.findIndex(x => x == d.artist);
    } else if (display == "genre") {
        ind = topgenres.findIndex(x => x == d.genre);
    } else {
        console.log("error");
    }
    if (selection != "default") {
        if (display == "artist" && d.artist != selection) {
            return "#D3D3D3";
        }
        if (display == "genre" && d.genre != selection) {
            return "#D3D3D3";
        }
    }
    if (ind == -1) {
        return "steelblue";
    }
    return d3.schemeSet3[ind];

}

function _zindex(d) {
    if (selection != "default") {
        if (display == "artist" && d.artist != selection) {
            return "6";
        }
        if (display == "genre" && d.genre != selection) {
            return "6";
        }
    }
    return "4"

}