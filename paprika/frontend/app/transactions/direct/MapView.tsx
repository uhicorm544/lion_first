'use client';

import { useEffect, useRef } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import styles from './MapView.module.css';

// 약속 장소 미선택 시 기본 중심 (강남역)
const DEFAULT_CENTER = { lat: 37.4979, lng: 127.0276 };

interface MapViewProps {
  placeId?: string;
  onPick?: (address: string) => void;
}

export default function MapView({ placeId, onPick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const placesLibRef = useRef<google.maps.PlacesLibrary | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  // 더블클릭 핸들러에서 항상 최신 onPick을 참조하도록 ref로 보관
  const onPickRef = useRef<MapViewProps['onPick']>(onPick);
  onPickRef.current = onPick;

  // 지정한 좌표에 마커를 다시 찍는다 (기존 마커는 제거)//LatLng구글이 주는 좌표 객체 LatLngLiteral { lat: 37.5, lng: 127.0 } 형태의 간단한 객체
  const placeMarker = (position: google.maps.LatLng | google.maps.LatLngLiteral) => {
    if (!mapRef.current) {
      return;
    }
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    markerRef.current = new google.maps.Marker({
      map: mapRef.current,
      position,
    });
  };

  // 최초 1회: 지도 스크립트 로드 + 지도 생성 + 더블클릭 이벤트 등록
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !containerRef.current) {
      return;
    }

    setOptions({ key: apiKey, v: 'weekly' });
    let cancelled = false;

    //지도 불러오기
    (async () => {
      const { Map } = await importLibrary('maps');
      const placesLib = await importLibrary('places');
      const { Geocoder } = await importLibrary('geocoding');
      if (cancelled || !containerRef.current) {
        return;
      }
      placesLibRef.current = placesLib;
      geocoderRef.current = new Geocoder();
      const map = new Map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        disableDoubleClickZoom: true, // 더블클릭 확대 대신 장소 선택으로 사용
      });
      mapRef.current = map;

      // 더블클릭한 위치를 역지오코딩하여 주소로 입력
      map.addListener('dblclick', (event: google.maps.MapMouseEvent) => {
        const latLng = event.latLng;
        if (!latLng || !geocoderRef.current) {
          return;
        }
        //주소변환을 기달리지 않고 바로 변환하고 마커 표시
        placeMarker(latLng);
        geocoderRef.current.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            onPickRef.current?.(results[0].formatted_address);
          }
        });
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // placeId가 바뀌면 해당 장소 좌표로 이동 + 마커 표시
  useEffect(() => {
    const moveToPlace = async () => {
      if (!placeId || !mapRef.current || !placesLibRef.current) {
        return;
      }

      const { Place } = placesLibRef.current;
      const place = new Place({ id: placeId });
      //fetchFields:Google Places API에 “이 placeId의 상세 정보를 가져온다.
      await place.fetchFields({ fields: ['location'] });

      if (!place.location) {
        return;
      }

      mapRef.current.setCenter(place.location);
      mapRef.current.setZoom(16);
      placeMarker(place.location);
    };

    moveToPlace();
  }, [placeId]);

  return <div ref={containerRef} className={styles.map} />;
}
