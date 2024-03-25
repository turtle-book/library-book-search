import ReactDOM from "react-dom/client";
import Modal from "react-modal";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";
import store from "./app/store";

import "./index.css";

Modal.setAppElement("#root");

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);
