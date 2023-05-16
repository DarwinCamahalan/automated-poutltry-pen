import { useEffect, useState } from "react";
import styles from "./content.module.scss";
import { db } from "../firebaseConfig";
import { onValue, ref } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage";

import { motion } from "framer-motion";

import { BsCalendar4Week, BsFan, BsDeviceSsd } from "react-icons/bs";
import { RiSensorLine } from "react-icons/ri";
import { FaTemperatureLow } from "react-icons/fa";
import { BiCameraHome } from "react-icons/bi";
import { GoLightBulb } from "react-icons/go";

const Content = () => {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [cameraTemperature, setCameraTemperature] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const dhtSensorRef = ref(db, "dht_sensor");
    const cameraSensorRef = ref(db, "camera_sensor");

    onValue(dhtSensorRef, (snapshot) => {
      const { temperature, humidity } = snapshot.val();
      setTemperature(temperature);
      setHumidity(humidity);
    });

    onValue(cameraSensorRef, (snapshot) => {
      const temperature = snapshot.val().temperature;
      setCameraTemperature(Math.round(temperature));
    });

    // Fetch the image URL from Firebase Storage
    const storageInstance = getStorage();
    const imageRef = storageRef(storageInstance, "image_capture.jpg");

    const fetchImageUrl = () => {
      getDownloadURL(imageRef)
        .then((url) => {
          setImageUrl(url);
        })
        .catch((error) => {
          console.log("Error fetching image URL:", error);
        });
    };

    // Fetch the initial image URL
    fetchImageUrl();

    // Fetch a new image URL every 1 second
    const interval = setInterval(fetchImageUrl, 1000);

    // Clean up the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.contentBG}>
      <div className={styles.info}>
        <div className={styles.dayCount}>
          <BsCalendar4Week className={styles.dayIcon} />
          <h1>Day</h1>
          <p>
            <span>1</span>
          </p>
        </div>

        <div className={styles.fan}>
          <BsFan className={styles.fanIcon} />
          <h1>Fan</h1>
          <p>
            Status: <span>OFF</span>
          </p>
        </div>

        <div className={styles.motor}>
          <RiSensorLine className={styles.motorIcon} />
          <h1>Motor</h1>
          <p>
            Status: <span>OFF</span>
          </p>
        </div>

        <div className={styles.bulb}>
          <GoLightBulb className={styles.bulbIcon} />
          <h1>Bulb</h1>
          <p>
            Status: <span>OFF</span>
          </p>
        </div>
      </div>
      <div className={styles.cameraImage}>
        {imageUrl && <img src={imageUrl} alt="Camera" />}
      </div>
      <div className={styles.sensors}>
        <div className={styles.averageTemp}>
          <FaTemperatureLow className={styles.avgTempIcon} />
          <h1>Average Temp.</h1>
          <p>
            <span>{temperature + cameraTemperature / 2} °C</span>
          </p>
        </div>
        <div className={styles.dhtSensor}>
          <BsDeviceSsd className={styles.dhtIcon} />
          <h1>DHT11</h1>
          <p>
            Temperature: <span>{temperature} °C</span>
          </p>
          <p>
            Humidity: <span>{humidity} %</span>
          </p>
        </div>
        <div className={styles.camSensor}>
          <BiCameraHome className={styles.camIcon} />
          <h1>MLX90640</h1>
          <p>
            Temperature: <span>{cameraTemperature} °C</span>
          </p>
        </div>

        <div className={styles.date}>
          <h1>Start Date</h1>
          <p>5/16/2023</p>
        </div>
      </div>
    </div>
  );
};

export default Content;