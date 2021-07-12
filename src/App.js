import React, { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng, } from "use-places-autocomplete";
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption, } from "@reach/combobox";
import axios from "axios";
import _ from "lodash";
import SwiperCore, { A11y, Navigation, Pagination, Scrollbar } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import "@reach/combobox/styles.css";
import 'swiper/swiper.min.css';
import 'swiper/components/navigation/navigation.min.css';
import 'swiper/components/pagination/pagination.min.css'

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);


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



function Search({ panTo, setImagesArray }) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete();


    const handleInput = (e) => {
        setValue(e.target.value);
    };

    const handleSelect = async (address) => {
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            panTo({ lat, lng });

        } catch (error) {
            console.log(" Error: ", error);
        }
    };

    return (

        <div className="search">
            <Combobox onSelect={handleSelect}>
                <ComboboxInput
                    value={value}
                    onChange={handleInput}
                    disabled={!ready}
                    placeholder="Search your location"
                />
                <ComboboxPopover>
                    <ComboboxList>
                        {status === "OK" &&
                            data.map(({ id, description }) => (
                                <ComboboxOption key={id + description} value={description} />
                            ))}
                    </ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
    );
}

function ImageContainer({ imagesArray }) {
    return (
        <div className={'insight-container'}>


            <Swiper
                init={false}
                spaceBetween={20}
                navigation
                slidesPerView={4}
                slidesPerGroup={4}
                pagination={{ clickable: true }}

            >

                {
                    imagesArray.map((imageRef, counter) => {
                        return (
                            <SwiperSlide key={'slide-' + counter}>

                                <Item imageRef={imageRef}></Item>

                            </SwiperSlide>
                        )

                    })
                }


            </Swiper>

        </div>

    )
}

function Item({ imageRef }) {
    let src = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + imageRef + "&key=" + process.env.REACT_APP_GOOGLE_API_KEY;

    var divStyle = {
        backgroundImage: 'url(' + src + ')',
        height: '300px',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',


    }
    return (
        <div style={divStyle}>
        </div>
    )
}