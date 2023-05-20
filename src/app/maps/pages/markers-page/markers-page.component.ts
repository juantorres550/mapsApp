import { Component, ElementRef, ViewChild } from '@angular/core';

import { LngLat, Map, Marker } from 'mapbox-gl';

interface MarkerAndColor {
  color: string;
  marker: Marker;
}

interface PlainMarker {
  color: string;
  lngLat: number[];
}

@Component({
  templateUrl: './markers-page.component.html',
  styleUrls: ['./markers-page.component.css']
})
export class MarkersPageComponent {
  @ViewChild('map') divMap?: ElementRef;

  public map?: Map;
  public lngLat: LngLat = new LngLat(-74.5, 40);
  public markers: MarkerAndColor[] = [];

  ngAfterViewInit(): void {

    if (!this.divMap) throw 'El elemento HTML no fue encontrado';
    this.map = new Map({
      container: this.divMap?.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.lngLat, // starting position [lng, lat]
      zoom: 10, // starting zoom
    });
    this.readFromLocaleStorage();
    // const markerHtml = document.createElement('div');
    // markerHtml.innerHTML = 'Juan T';

    // const marker = new Marker(
    //   {
    //     element: markerHtml,
    //   }
    // ).setLngLat(this.lngLat).addTo(this.map);

  }

  createMarker() {
    if (!this.map) return;
    const color = '#xxxxxx'.replace(/x/g, y => (Math.random() * 16 | 0).toString(16));
    const lngLat = this.map.getCenter();

    this.addMarker(lngLat, color);
  }

  addMarker(lngLat: LngLat, color: string) {
    if (!this.map) return;

    const marker = new Marker({
      color: color,
      draggable: true,
    }).setLngLat(lngLat)
      .addTo(this.map)

    this.markers.push({
      color,
      marker,
    });
    this.saveToLocaleStorage();
    marker.on('dragend', () => this.saveToLocaleStorage());
  }

  deleteMarker(i: number) {
    this.markers[i].marker.remove();
    this.markers.splice(i, 1);
  }

  flyTo(marker: Marker) {
    this.map?.flyTo({
      zoom: 14,
      center: marker.getLngLat(),
    })
  }

  saveToLocaleStorage() {
    const plainMarkers: PlainMarker[] = this.markers.map(({ color, marker }) => {
      return {
        color,
        lngLat: marker.getLngLat().toArray(),
      }
    });

    localStorage.setItem('plainMarkers', JSON.stringify(plainMarkers));
  }

  readFromLocaleStorage() {
    const plainMarkersString = localStorage.getItem('plainMarkers') ?? '[]';
    const plainMarkers: PlainMarker[] = JSON.parse(plainMarkersString);
    plainMarkers.forEach(({ color, lngLat }) => {
      const [lng, lat] = lngLat;
      const coords = new LngLat(lng, lat);
      this.addMarker(coords, color);
    });
  }
}
