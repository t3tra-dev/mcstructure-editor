import { createTheme } from "@mui/material/styles";

export default createTheme({
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
    },
  },
});
