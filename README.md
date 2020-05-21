# pharmacies

## key remark

this project is fork from https://github.com/Wcc723/wheremask
I only modify a little, variable and little bit of refactor to familair with the Vue concept


## learning note
- how to use bootstrp, its css tag to decorate your HTML style, like mb-0 small text-muted..etc
- html tag, like...what is no-gutters? what is flex-fill, d-flex?
- more on html tag, what do we have in label and select option tag
- how to get particular info in Json data
- some linter check points
- how to setup a open street map via leaflet, add, remove marker and layer, pan, add html stuff..etc
- 然後update marker就會包括filter到需要的data, 從filter的area拿座標，再pan過去
- app啟動，一開始就是把map mount上去，和拿資料，也跑update marker
- 另一個重要的操作就是換地方
- update select後，需要remove marker, update marker, 和pan
- 因此對於每一個event的後續操作邏輯要很清楚。
- 基本上就是一個很基本的操作，一打開render好後，可以選區域。
- 用到v-model去雙向綁定選單，vue常見作法，換區域用@change觸發
- 畫面上的藥局，也可以點擊觸發pan事件
 

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Run your unit tests
```
npm run test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
