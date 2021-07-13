import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

import axios from "axios";
import _ from "lodash";

import Search from "./Search";
import ImageContainer from "./ImageContainer";

const libraries = ["places"];

const mapContainerStyle = {
    height: "100vh",
    width: "100vw",
};
const options = {
    zoomControl: true,
};

//New Delhi center
const center = {
    lat: 28.613939,
    lng: 77.209023,
};

export default function App() {

    const [imagesArray, setImagesArray] = useState([])

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
        libraries,
    });
    const [marker, setMarker] = useState({ lat: center.lat, lng: center.lng });

    const getImagesFromPlaceId = (place_id) => {
        const detailsApi = 'https://cors-anywhere.herokuapp.com/' + 'https://maps.googleapis.com/maps/api/place/details/json?place_id=' + place_id + '&key=' + process.env.REACT_APP_GOOGLE_API_KEY;
        axios.get(detailsApi)
            .then(details => {
                let referencesArray = !_.isEmpty(_.get(details, 'data.result.photos')) && _.get(details, 'data.result.photos').map(photo => photo.photo_reference)
                setImagesArray(referencesArray);
            })
    }

    const loadImages = (lat, lng) => {

        let placeId;

        if (lat && lng) {
            var geocoder = new window.google.maps.Geocoder;

            var latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

            geocoder.geocode({ 'location': latlng }, function (results, status) {
                if (status === window.google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        placeId = results[1].place_id;
                        getImagesFromPlaceId(placeId)
                    } else {
                        window.alert('No results found');
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
        }
    }

    const onMapClick = useCallback((e) => {

        setMarker({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        });

        loadImages(e.latLng.lat(), e.latLng.lng())

    }, []);

    const mapRef = useRef();

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const panTo = useCallback(({ lat, lng }) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14);
        setMarker({ lat: lat, lng: lng })
    }, []);

    if (loadError) return "Error";
    if (!isLoaded) return "Loading...";



    return (
        <div className={'map-container'}>

            <Search panTo={panTo} setImagesArray={setImagesArray} />

            <div className={imagesArray.length ? 'has-images' : ''}>
                <GoogleMap
                    id="map"
                    mapContainerStyle={mapContainerStyle}
                    zoom={8}
                    center={center}
                    options={options}
                    onClick={onMapClick}
                    onLoad={onMapLoad}
                >
                    <Marker position={{ lat: marker.lat, lng: marker.lng }} />

                </GoogleMap>
            </div>



            {
                imagesArray.length ?
                    <ImageContainer imagesArray={imagesArray}></ImageContainer> : null

            }
        </div>
    );
}