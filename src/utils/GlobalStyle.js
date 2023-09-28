import { createGlobalStyle } from "styled-components";
// import "../assets/scss/fonts.scss";

const GlobalStyle = createGlobalStyle`
  body,html{
    background: #f0f3f8;
    color: #000;
    padding: 0;
    margin: 0;
  
  }
  //*{
  //  font-family: "fonts";
  //}
  a{
    text-decoration: none;

  }
`;

export default GlobalStyle;
