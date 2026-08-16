/*
 * Hanten Map
 * Version 0.1
 *
 * Shared cartographic utilities for Hanten exhibits.
 * Canonical location:
 * 04 Shared Assets/js/hanten-map.js
 *
 * Requires D3 v7.
 * TopoJSON conversion requires topojson-client.
 */

window.HantenMap = (() => {

  function create(options = {}) {
    const {
      selector,
      width = 975,
      height = 610,
      projection = d3.geoAlbersUsa(),
      featureCollection = null,
      padding = 0
    } = options;

    if (!selector) {
      throw new Error("HantenMap.create requires a selector.");
    }

    if (!featureCollection) {
      throw new Error("HantenMap.create requires a featureCollection.");
    }

    const svg = d3
      .select(selector)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    projection.fitExtent(
      [
        [padding, padding],
        [width - padding, height - padding]
      ],
      featureCollection
    );

    const path = d3.geoPath(projection);

    return {
      svg,
      path,
      projection,
      width,
      height,
      featureCollection
    };
  }


  function fromTopology(topology, objectName) {
    if (!topology) {
      throw new Error("HantenMap.fromTopology requires a topology object.");
    }

    if (!topology.objects || !topology.objects[objectName]) {
      throw new Error(
        `HantenMap.fromTopology could not find topology object "${objectName}".`
      );
    }

    return topojson.feature(
      topology,
      topology.objects[objectName]
    );
  }


  function drawFeatures(map, options = {}) {
    const {
      features = map.featureCollection.features,
      className = "hanten-map-feature",
      fill = "#d6dbd0",
      stroke = "#ffffff",
      strokeWidth = 0.6,
      groupClass = "hanten-map-layer"
    } = options;

    const group = map.svg
      .append("g")
      .attr("class", groupClass);

    const paths = group
      .selectAll("path")
      .data(features)
      .join("path")
      .attr("class", className)
      .attr("d", map.path)
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("vector-effect", "non-scaling-stroke");

    return paths;
  }


  function tooltip(options = {}) {
    const {
      container,
      id = "hanten-map-tooltip"
    } = options;

    const parent =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!parent) {
      throw new Error("HantenMap.tooltip requires a valid container.");
    }

    let tip = parent.querySelector(`#${id}`);

    if (!tip) {
      tip = document.createElement("div");
      tip.id = id;

      Object.assign(tip.style, {
        position: "absolute",
        display: "none",
        pointerEvents: "none",
        zIndex: "10"
      });

      parent.appendChild(tip);
    }

    function show(event, html) {
      tip.innerHTML = html;
      tip.style.display = "block";

      const bounds = parent.getBoundingClientRect();

      tip.style.left =
        Math.min(
          event.clientX - bounds.left + 14,
          bounds.width - tip.offsetWidth - 10
        ) + "px";

      tip.style.top =
        event.clientY - bounds.top + 14 + "px";
    }

    function hide() {
      tip.style.display = "none";
    }

    return {
      element: tip,
      show,
      hide
    };
  }


  return {
    create,
    fromTopology,
    drawFeatures,
    tooltip
  };

})();
