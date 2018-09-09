window.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.innerHTML = `
    #source {
      max-height: none !important;
      padding-right: 50px !important;
    }
    *:not(.moremenu) {
      box-shadow: none !important;
    }
    ::-webkit-scrollbar,
    .go-wrap,
    .ad-panel {
      display: none !important;
    }
    :focus {
      outline: none !important;
    }
    .gb_Dd {
      margin-top: -1px !important;
      height: 0 !important;
      overflow: hidden !important;
      padding: 0 !important;
    }
    .frame {
      height: 100vh !important;
    }
    .jfk-button-flat:focus {
      border-color: transparent !important;
    }
  `;
  document.head.append(style);
});
