import React from "react";

import SwiperCore, { A11y, Navigation, Pagination, Scrollbar } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper.min.css';
import 'swiper/components/navigation/navigation.min.css';
import 'swiper/components/pagination/pagination.min.css';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

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

export default ImageContainer