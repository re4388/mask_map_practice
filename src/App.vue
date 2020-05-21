<template>
  <div class="home row no-gutters">
    <div class="col-sm-3">
      <div v-if="cityNameData.length" class="toolbox">
        <div class="sticky-top bg-white shadow-sm p-2">
          <div class="form-group d-flex">
            <label for="cityNameData" class="mr-2 col-form-label text-right">縣市</label>
            <div class="flex-fill">
              <select id="cityNameData" class="form-control"
              v-model="select.city" @change="select.area = ''">
                <option value="">-- Select One --</option>
                <option v-for="city in cityNameData" :value="city.CityName" :key="city.CityName">
                  {{ city.CityName }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group d-flex">
            <label for="area" class="mr-2 col-form-label text-right">地區</label>
            <div class="flex-fill">
              <!-- we only updateSelect when we select the area -->
              <select id="area" class="form-control" v-if="select.city.length"
                v-model="select.area" @change="updateSelect">
                <option value="">-- Select One --</option>
                <option :value="area.AreaName"
                v-for="area in cityNameData.find( city => city.CityName === select.city).AreaList"
                :key="area.AreaName">
                  {{ area.AreaName }}
                </option>
              </select>
            </div>
          </div>
          <p class="mb-0 small text-muted text-right">請先選擇區域查看（綠色表示還有口罩）</p>
        </div>

        <ul class="list-group">
          <template v-for="(item, key) in data">
            <a class="list-group-item text-left" :key="key"
              v-if="item.properties.county === select.city
                && item.properties.town === select.area"
              :class="{ 'highlight': item.properties.mask_adult || item.properties.mask_child}"
              @click="penTo(item)">
              <h3>{{ item.properties.name }}</h3>
              <p class="mb-0">
                成人口罩：{{ item.properties.mask_adult}} | 兒童口罩：{{ item.properties.mask_child}}
              </p>
              <p class="mb-0">地址：<a :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                target="_blank" title="Google Map">
                {{ item.properties.address }}</a>
              </p>
            </a>
          </template>
        </ul>
      </div>
    </div>
    <div class="col-sm-9">
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// use leaaflet to build open map
import L from 'leaflet';
// get Taiwan city and area info, to select
import cityNameData from './assets/cityName.json';

let osmMap = {};

// data prep for icons
const iconsConfig = {
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
};

// data prep for osm
const icons = {
  green: new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    ...iconsConfig,
  }),
  grey: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    ...iconsConfig,
  }),
};

// and osm obj with 3 methods
const osm = {
  addMapMarker(x, y, item) {
    const icon = item.mask_adult || item.mask_child ? icons.green : icons.grey;
    L.marker([y, x], {
      icon,
    }).addTo(osmMap).bindPopup(`<strong>${item.name}</strong> <br>
    口罩剩餘：<strong>成人 - ${item.mask_adult ? `${item.mask_adult} 個` : '未取得資料'}/ 兒童 - ${item.mask_child ? `${item.mask_child} 個` : '未取得資料'}</strong><br>
    地址: <a href="https://www.google.com.tw/maps/place/${item.address}" target="_blank">${item.address}</a><br>
    電話: ${item.phone}<br>
    <small>最後更新時間: ${item.updated}</small>`);
  },
  removeMapMarker() {
    osmMap.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        osmMap.removeLayer(layer);
      }
    });
  },
  penTo(x, y, item) {
    const icon = item.mask_adult || item.mask_child ? icons.green : icons.grey;
    osmMap.panTo(new L.LatLng(y, x));
    L.marker([y, x], {
      icon,
    }).addTo(osmMap).bindPopup(`<strong>${item.name}</strong> <br>
    口罩剩餘：<strong>成人 - ${item.mask_adult ? `${item.mask_adult} 個` : '未取得資料'}/ 兒童 - ${item.mask_child ? `${item.mask_child} 個` : '未取得資料'}</strong><br>
    地址: <a href="https://www.google.com.tw/maps/place/${item.address}" target="_blank">${item.address}</a><br>
    電話: ${item.phone}<br>
    <small>最後更新時間: ${item.updated}</small>`).openPopup();
  },
};

export default {
  name: 'home',
  data: () => ({
    cityNameData,
    data: {},
    osmMap: {},
    select: {
      city: '新北市',
      area: '中和區',
    },
  }),
  mounted() {
    // use L to setup map center and zoon
    osmMap = L.map('map', {
      center: [25.03, 121.55],
      zoom: 15,
    });
    // addlayer and zoon level to it
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '<a target="_blank" href="https://www.openstreetmap.org/">© OpenStreetMap 貢獻者</a>',
      maxZoom: 18,
    }).addTo(osmMap);

    // get mask data and put into data
    this.$http.get('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')
      .then((res) => {
        this.data = res.data.features;
        // after we get data, we update marker
        this.updateMarker();
      });
  },
  methods: {
    updateMarker() {
      // only get data with selected city and area
      const pharmacies = this.data.filter((pharmacy) => {
        // if we don't select area,filter only city/county
        if (!this.select.area) {
          return pharmacy.properties.county === this.select.city;
        }
        return pharmacy.properties.town === this.select.area;
      });
      // get coordinates from data and add to map
      pharmacies.forEach((pharmacy) => {
        const { properties, geometry } = pharmacy;
        osm.addMapMarker(
          geometry.coordinates[0],
          geometry.coordinates[1],
          properties,
        );
      });
      // pan to the first one of the selected this.data
      this.penTo(pharmacies[0]);
    },
    removeMarker() {
      osm.removeMapMarker();
    },
    penTo(pharmacy) {
      const { properties, geometry } = pharmacy;
      osm.penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
    },
    updateSelect() {
      // 1. remove old marker, 2. update to new marker 3. pan to those pharmacy
      this.removeMarker();
      this.updateMarker();
      const pharmacy = this.data.find(item => item.properties.town === this.select.area);
      this.penTo(pharmacy);
      // const pharmacy = this.data.find(item => item.properties.town === this.select.area);
      // const { geometry, properties } = pharmacy;
      // osm.penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
    },
  },

};
</script>

<style lang="scss">
@import 'bootstrap/scss/bootstrap';

#map {
  height: 100vh;
}

.home {
  position: relative;
}

.highlight {
  background: #e9ffe3;
}

.toolbox {
  height: 100vh;
  overflow-y: auto;

  a {
    cursor: pointer;
  }
}
</style>
