## Run ExpoCamera and TensorFlow Posemodel
To run the entire application, it is prefereable to follow the instructions [here](https://github.com/SIXRIP7ER/connectedHealthApp).
The backend can be found [here](https://github.com/nick-maiden/connectedhealth).

However, if you want to clone and run this repository in isolation, this can be done as follows:

Requires:
- nodejs : https://nodejs.org/en/download
- yarn
- Expo Go App (ios/andriod)  

First:
```
git clone https://github.com/realRickyNguyen/ExpoCAMwithTensor.git
cd ExpoCAMwithTensor
yarn
```

Now, to run with mobile application (using ip on local network):
```
npx expo start
```

Inside the application, for the code, enter the local IP Address and Port given by the Back-End.
for example: 192.168.0.137:8000

# If expo is outdated:
yarn add expo@latest
npx expo install --fix