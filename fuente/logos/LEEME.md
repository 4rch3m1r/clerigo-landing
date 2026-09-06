# Los cuatro logotipos que faltan

Suelta aquí los SVG oficiales con **estos nombres exactos**:

```
vicarius.svg
tenable.svg
rapid7.svg
manageengine.svg
```

Con eso los meto en la tira de integraciones de la portada y quito las chapas
de iniciales que hay ahora.

## De dónde se sacan

Casi todas las empresas los publican en su web, en una página que suele
llamarse **Brand**, **Brand assets**, **Press kit** o **Media kit**. Busca la
versión **SVG** y a ser posible la del **isotipo** —el símbolo solo, sin el
nombre al lado—, porque el nombre ya va escrito en la ficha.

| | qué hace falta |
|---|---|
| `vicarius.svg` | el símbolo de Vicarius |
| `tenable.svg` | el símbolo de Tenable (vale el de Nessus si lo tienen aparte) |
| `rapid7.svg` | el símbolo de Rapid7 |
| `manageengine.svg` | el de ManageEngine, o el de ServiceDesk Plus si tiene el suyo |

## Qué hago yo con ellos

Los recorto a un lienzo de 24×24, les quito lo que no haga falta y los pongo
en `fuente/rebrandear.cjs` al lado de los de Teams, Defender y Meet. La ficha
queda igual que las demás: símbolo a la izquierda, nombre a la derecha.

## Por qué no los dibujo yo

Teams, Defender y Meet sí los dibujé: son formas geométricas conocidas y se
pueden reproducir sin equivocarse. Estos cuatro no me los sé de memoria, y un
logotipo dibujado «parecido» está mal. Además es marca registrada de otro: lo
correcto es usar el fichero que ellos publican.
