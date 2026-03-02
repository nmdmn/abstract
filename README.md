# abstract

### audiovisual entertainment

## usage

install

```sh
yarn install && yarn upgrade-interactive --latest
```

build

```sh
yarn build
```

run

```sh
yarn start
```

clean-up (delete build and release dirs: [rel, dist])

```sh
yarn clean
```

remove node_modules and clean-up (delete dirs: [node_modules, rel, dist, .parcel-cache])

```sh
yarn clearup
```

### see more detail in package.json

## video capture

* the App constructor expects capture-rate as 3rd param.
* any other value than 0 enable the capture logic (e.g.: 30)
* run the simple capture web-server to write the frames into files:

```sh
node capture.js
```

* run the webpage with the usual "yarn start"
* compose the video from the PNGs:

```sh
ffmpeg -r 30 -i capture/%05d.png -y capture.webm
```
