import { definePreset } from '@primeuix/themes';
import Nora from '@primeuix/themes/nora';

const PetelTheme = definePreset(Nora, {
  semantic: {
    primary: { // 金色：Amber
      50:'{amber.50}',100:'{amber.100}',200:'{amber.200}',300:'{amber.300}',
      400:'{amber.400}',500:'{amber.500}',600:'{amber.600}',700:'{amber.700}',
      800:'{amber.800}',900:'{amber.900}',950:'{amber.950}'
    },
    colorScheme: {
      light: {
        primary: { color:'{amber.600}', hoverColor:'{amber.700}', activeColor:'{amber.800}', inverseColor:'#1f2937' }
      },
      dark: {
        primary: { color:'{amber.400}', hoverColor:'{amber.300}', activeColor:'{amber.200}', inverseColor:'#0b0f19' }
      }
    },
    surface: { // 奶油底＋咖啡陰影
      0:'#fffaf1',50:'#fff3df',100:'#ffe9c8',200:'#ffe0b3',300:'#f7d7a3',
      400:'#eecb93',500:'#e6bf84',600:'#d9b477',700:'#caa569',800:'#b9925a',
      900:'#a8814d',950:'#70412d'
    }
  },
  radius: { sm:'6px', md:'10px', lg:'14px', xl:'18px' }
});
export default PetelTheme;
