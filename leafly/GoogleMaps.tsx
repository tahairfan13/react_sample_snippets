import React, { useCallback, useContext } from "react";
import GoogleMapReact, { ClickEventValue, Coords } from "google-map-react";
import getConfig from "next/config";

import FinderResultsContext from "context/FinderResultsContext";
import LocationContext from "context/LocationContext";
import MapContext from "context/MapContext";
import UIContext from "context/UIContext";
import { FinderLocation } from "custom-types/Finder";
import { Store } from "custom-types/Store";
import { useEventTracker } from "hooks/useEventTracker";
import { createMapOptions } from "utils/finder/mapUtils";
import responsiveEvent from "utils/responsiveEvent";
import { Action, Category } from "utils/trackEvent";

import MeMarker from "components/Finder/FinderMap/MeMarker";

import MapMarker from "./MapMarker";

import { useSplitToggle } from "hooks/useSplit";

const { publicRuntimeConfig } = getConfig();

type Props = {
  listingPosition?: string; // future prop
  isDesktop?: boolean; // future prop
  userLocation?: FinderLocation;
  stores?: Store[]; // future prop
  setListPosition: (a: number) => void;
};

const GoogleMap = ({
  listingPosition,
  isDesktop,
  userLocation: userLocationFromProps,
  stores,
  setListPosition,
}: Props) => {
  const {
    mapCenter: { lat, lon },
    zoomLevel,
    handleMapChange,
    selectedStore,
    setSelectedStore,
    setShowSearchButton,
    setMapInitialized,
    setMapReady,
    hoveredStore,
  } = useContext(MapContext);

  const { publishEvent } = useEventTracker();

  const { mapStylingEnabled } = useContext(UIContext);
  const { userLocation: userLocationFromContext } = useContext(LocationContext);
  const { mapMarkers } = useContext(FinderResultsContext);

  const userLocation = userLocationFromProps || userLocationFromContext;

  const meMarker = userLocation?.coordinates;

  const shouldShowMeMarker =
    userLocation?.isUserLocation ||
    (userLocation?.street?.name?.length &&
      userLocation.street.name.length > 0 &&
      userLocation.street.number.length > 0);

  const useSpotlightOptimization = useSplitToggle(
    "webWeb_spotlightOptimization_frontend"
  );

  // @ts-ignore (fix me please, do not replicate)
  const initializeMapListeners = ({ map, maps }) => {
    setMapInitialized(true);

    maps.event.addListener(map, "dragstart", () => {
      responsiveEvent({
        mobile: () => {
          if (!useSpotlightOptimization) {
            setSelectedStore(undefined);
          }
        },
      });
    });

    maps.event.addListener(map, "dragend", () => {
      publishEvent({
        action: Action.click,
        category: Category.map,
        label: "map drag",
      });
      setShowSearchButton(true);
    });
  };

  const handleZoomChange = (e: any) => {
    setShowSearchButton(true);
  };

  const _setSelectedStore = (classList: DOMTokenList) => {
    if (!classList.contains("finder-map-marker")) {
      setSelectedStore(undefined);
    }
  };

  const handleClick = useCallback(
    ({ event }: { event: React.MouseEvent<ClickEventValue> }) => {
      _setSelectedStore((event.target as Element).classList);
    },
    []
  );

  const handleMapReady = () => {
    setMapReady(true);
  };

  const center: Coords = { lat, lng: lon };

  return (
    <GoogleMapReact
      bootstrapURLKeys={{
        key: publicRuntimeConfig.googleMapsApiKey,
        libraries: ["geometry", "places"],
      }}
      resetBoundsOnResize={true}
      hoverDistance={45}
      center={center}
      options={createMapOptions(mapStylingEnabled)}
      onChange={handleMapChange}
      onClick={handleClick}
      onGoogleApiLoaded={initializeMapListeners}
      zoom={zoomLevel}
      onTilesLoaded={handleMapReady}
      shouldUnregisterMapOnUnmount={false}
      onDragEnd={() => setShowSearchButton(true)}
      yesIWantToUseGoogleMapApiInternals={true}
      onZoomAnimationEnd={handleZoomChange}
      onZoomAnimationStart={setListPosition}
    >
      {mapMarkers?.map((mapMarker, idx) => {
        if (!mapMarker.lat || !mapMarker.lon) {
          return null;
        }
        return (
          <MapMarker
            lat={Number(mapMarker.lat)}
            lng={Number(mapMarker.lon)}
            key={`map-marker-${idx}`}
            mapMarker={mapMarker}
            isSelected={isMapMarkerSelected(mapMarker, selectedStore)}
            isHovered={hoveredStore === mapMarker.id}
            setSelectedStore={setSelectedStore}
          />
        );
      })}
      <MeMarker
        lat={Number(meMarker.lat)}
        lng={Number(meMarker.lon)}
        shouldShowMeMarker={!!shouldShowMeMarker}
      />
    </GoogleMapReact>
  );
};

// @ts-ignore (fix me please, do not replicate)
const isMapMarkerSelected = (mapMarker, selectedStore) => {
  return (
    selectedStore &&
    mapMarker.id === selectedStore.id &&
    selectedStore.lat === mapMarker.lat &&
    selectedStore.lon === mapMarker.lon
  );
};

export default GoogleMap;
