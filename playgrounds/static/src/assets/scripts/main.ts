/* --------- 　ここから編集禁止  ------------- */
import.meta.glob(["../images/**"]);
/* --------- 　ここまで編集禁止  ------------- */

import "../styles/global.css";

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('HMR 更新');
  });
}
