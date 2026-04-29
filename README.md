# Proyecto : Campus

# Especificación de Requsitos Software (Formato IEEE Std. 830-1998)

## Indice

1. Introduccion 
    1.1 Propósito
    1.2 Alcance
    1.3 Definiciones, acrónimos y abreviaturas
    1.4 Referencias
    1.5 Organización del documento
2. Descripción general
    2.1 Perspectiva del producto
    2.2 Funciones del producto
    2.3 Características del usuario
    2.4 Restricciones
    2.5 Supuestos y dependencias
    2.6 Requesitos futuros
3. Requisitos específicos
    3.1 Interfaces externas
        3.1.1 Interfaces hardware
        3.1.2 Interfaces software
        3.1.3 Interfaces de comunicación
    3.2 Requisitos funcionales
        3.2.1  Módulo Auth 
        3.2.2  Módulo Bullet 
        3.2.3  Módulo Comment
        3.2.4  Módulo Facehunt 
        3.2.5  Módulo Game
        3.2.6  Módulo Gamemode
        3.2.7  Módulo Like
        3.2.8  Módulo Message
        3.2.9  Módulo Player
        3.2.10 Módulo Role
        3.2.11 Módulo Shot
        3.2.12 Módulo User
        3.2.13 Módulo Weapon
        3.2.14 Módulo Reconocimiento de Imagen
        3.2.15 Página Index
        3.2.16 Página Settings
        3.2.17 Página Account
        3.2.18 Página Friends
        3.2.19 Página Facehunt
        3.2.20 Página Create
        3.2.21 Página Join
        3.2.22 Página Game
        3.2.23 Página Chat
        3.2.21 Módulo Localización
    3.3 Requisitos de rendimiento
    3.4 Requisitos lógicos de la base de datos
    3.5 Restricciones de diseño
    3.6 Atributos del sistema software
    3.7 Otros requisitos
4. Apéndices

## 1 Introdución

### 1.1 Propósito

Juego social que integre las funcionalidades de un juego moderno con la integración y beneficios que trae una red social aprovechando el espacio real para fomentar la actividad física. Facehunter proporciona un juego, una red social y un videojuego, todo en uno y para prácticamente todos los dispositivos. Facehunter tratará de ofrecer diversión, conexión y ejercicio para todos los perfiles y la mayor cantidad de dispositivos posible.

### 1.2 Alcance

Facehunter pretende ofrecer un juego multijugador dinámico con dos modos, un modo más social, y otro modo más competitivo. El modo más social consistirá en tomar fotos de los otros jugadores, estilo pilla pilla. Estas fotos serán evaluadas con IA, o por los jugadores (depende de la modalidad) obteniendo así la puntuación de la partida. Los jugadores entonces podrán subir las mejores capturas (facehunts) a la red social, actuando esta como un ciclo retroalimentativo que incentiva jugar al juego, y consumir los momentos más icónicos de las partidas. El modo competitivo se centra más en la captura de los otros usuarios, y es como un shooter ofreciendo partidas más dinámicas.

El juego proporcionará diversas armas, balas, roles, animaciones, emoticonos y modos de juego. ~Los distintos recursos se podrán conseguir a través de unas monedas ingame, las cuales se proporcionarán de manera gratuita. Los usuarios que quieran acelerar su progreso o conseguir elementos COSMÉTICOS más exclusivos tendrán que hacerse miembros de pago.

La red social proporcionará la publicación de los facehunts (posts), chat con amigos, personalización del perfil, invitación rápida a amigos, y comentario/like de tus facehunts favoritos.

Facehunter proporcionará la posibilidad de jugar sin estar registrado, lo único que no podrá acceder a las funcionalidades de la red social por razones obvias.

No incluirá realidad aumentada, al menos de momento. También las funcionalidades de la red social serán como las de un Instagram simplificado, al menos el las primeras versiones para enfocar más en el juego y la intercción.

### 1.3 Definiciones, acrónimos y abreviaturas

**Definiciones** :

- Jugador : Usuario anónimo o registrado que participa en un juego facehunt.
- Bala : Item que condiciona el daño que hace un disparo de un jugador. (Exclusivo del modo hunter).
- Modalidad: Variación entre el modo face o modo hunter.
- Rol : Plantilla que define los atributos de un jugador. Habrá distintos roles dependiendo de la modalidad.
- Facehunt : Foto, o "cazada", que identifica la captura o eliminación de otro jugador de una manera interesante y que sirva para subirlo a la red social.
- Modo face : Modalidad que consiste tomar fotos y posteriormente votar las más graciosas o virales.
- Modo hunter : Modalidad más competitiva donde es un shooter integrado en la realidad.
- Facehunter : Nombre del juego.
- Módulo: Componente funcional que realiza tareas específicas del sistema
- React : Framework de javascript para la interfaz de la app.
- MongoDB : Sistema de bases de datos no relacional que gestionará todos los datos.
- Usuario anónimo : Usuario que no ha sido registrado en la aplicación.
- NestJS : Framework de javascript que gestiona los cálculos y operaciones.
- NodeJS : Entorno donde se ejecutará el código javascript
- Framework: Conjunto de herramientas 

**Acrónimos** :

- UI : User Interface
- UX : User Experience
- DB : Data base
- API : Application Programming Interface

**Marcadores** :

- ~ : Algo a consultar
- $ : Algo que tengo que añadir todavia
- & : Habrá que cambiar quizas
- · : Sección generado por IA

### 1.4 Referencias

### 1.5 Organización del documento

## 2. Descripción general

### 2.1 Perspectiva del producto

Facehunter será un juego móvil para Android e IOS. Es un sistema totalmente nuevo, tanto la red social como el juego se harán de cero. El juego en específico es una idea nueva y utiliza módulos personalizados de Kotlin y Swift. Los usuarios son todos aquellos que quieran jugar partidas rápidas con sus amigos y pasar un buen rato en cualquier momento del día, desde un descanso del trabajo hasta en el recreo con sus amigos. Los usuarios podrán agregarse entre ellos haciendo así amistades. Los amigos podrán chatearse entre ellos e invitar a partidas que creen. El tech stack utilizado será MongoDB para la BD, NestJS para el backend, React para el frontend, y una API con un servidor personalizado que gestionará todo lo relacionado con el reconocimiento de imagen. Este servidor tendrá una aplicación en Python con el framework Flask. Las imagenes se almacenarán y se podrán acceder haciendo uso de CDN. Para la autenticación los usuarios podrán decidir no registrarse, registrarse en la aplicación, o unirse mediante las siguientes aplicaciones externas:

- TikTok
- Instagram
- Facebook
- Google

La versión de NodeJS será la última v20+ y no habrá versión web.

### 2.2 Funciones del producto

- ~Configuración
    - nombre de usuario
    - email
    - cuentas asociadas (tiktok / google / facebook / instagram)
    - cambiar contraseña
    - borrar cuenta
    - desactivar cuenta
    - monetización

- ~Cuenta (registrarse es opcinal para jugar, obligatorio para la red social)
    - nombre de jugador
    - créditos
    - ~árbol de  habilidades o algo para darle sentido a los roles (dan emotes o algo)
    - roles disponibles
    - comprar roles
    - comprar créditos
    - armas disponibles
    - comprar armas
    - ~pase de batalla
    - ~emotes disponibles
    - ~iconos disponibles
    - ~banner/insignia disponibles
    - ~comprar cosméticos

- Red social
    - Compartir tus mejores momentos
    - Comentar en los facehunts de otros
    - Guardar en favoritos los facehutns de otros
    - $Añadir amigos
    - Chatear con tus amigos ~(no imágenes)
    - Bloquear amigos

- Juego
    - Crear juego con opciones
        - Modo de juego
    - Unir a un juego
        - Elegir rol (exclusivo modo hunter)
        - Comprar balas &antes del juego (exclusivo modo hunter)
        - Elegir arma (exclusivo modo hunter)
        - Escanear QR para el código del juego
        - Ver cuantos jugadores están preparados
    - Modo face : capturar fotos de las caras de los contrincantes
    - Modo hunter : eliminar contrincantes tomando fotos (no hace falta que sea de la cara)
    - Evaluación :
        - Modo face: reconocimiento de imagen para descartar las peores, y votación para votar las mejores
        - Modo hunter: algoritmo EKFK (EFK pero editado por Kei) con RSSI para identificar víctima y reconocimiento de imagen para determinar la parte del cuerpo acertada, y si el disparo es satisfactorio. ~(No hay votación, por lo que no habrá facehunts).
    - Tabla de puntuaciones :
        - Jugadores autenticados obtienen créditos
        - Añadir a los jugadores con los que has jugado


### 2.3 Características del usuario

Habrán distintos tipos de usuarios:
**Usuario anónimo**: No se ha registrado y no puede usar la red social. Cada partida tiene siempre un número determinado de créditos.
**Usuario registrado**: Tiene acceso a todas las funciones básicas de facehunter.
~**Usuario premium**: Paga una subscripción mensual tiene accesos a beneficios cosméticos.
**Usuario admin**: Puede banear usuarios, editar modos de juego, balas, roles y armas. Acceso a la base de datos desde la consola.

Los usuarios generales serán todos aquellos que quieran jugar a algún juego y pasar el rato. El diseño estará adecuado para aquellos que tengan poca experiencia previa en algún otro juego. Será lo más accesible posible y para todas las edades.

### · 2.4 Restricciones

- **Plataforma y tecnología**:  
  - La aplicación se desarrollará en **React Native** para compatibilidad multiplataforma (Android/iOS).  
  - El backend se implementará con **NestJS** y **MongoDB** como base de datos.  
  - Se utilizará **Bluetooth Low Energy (BLE)** para la comunicación entre dispositivos, lo cual restringe la funcionalidad de localización a dispositivos que soporten BLE.  

- **Dependencias externas**:  
  - API de procesamiento de imagen basada en **Flask**, que requiere disponibilidad de red y latencia mínima para un rendimiento aceptable.  
  - Bibliotecas de terceros necesarias para BLE, React Native y NestJS.  

- **Almacenamiento y distribución de contenido**:  
  - Imágenes y medios se servirán a través de **CDN** para optimizar tiempos de carga.  
  - La base de datos y backend pueden estar alojados en **Amazon EC2** o un servicio similar, garantizando disponibilidad y escalabilidad.  

- **Limitaciones de hardware y red**:  
  - Para la localización relativa se requiere que los dispositivos tengan BLE habilitado.  
  - El rendimiento de la app puede verse afectado por la calidad de la conexión de red al comunicarse con el servidor y la base de datos.  

- **Restricciones de compatibilidad y versiones**:  
  - La app soportará versiones recientes de Android e iOS (definir versiones mínimas según pruebas).  
  - Uso de APIs modernas y librerías que pueden no ser compatibles con versiones antiguas del sistema operativo.

### · 2.5 Supuestos y dependencias

#### Supuestos
- Se asume que los dispositivos del usuario cuentan con **Bluetooth Low Energy (BLE)** activo y funcional.  
- Se asume que los usuarios tienen **dispositivos móviles compatibles** con React Native (Android/iOS recientes).  
- Se asume que los usuarios permitirán el acceso a **sensores de movimiento** (acelerómetro, giroscopio) si se utiliza para la localización relativa.  
- Se asume que la **conexión a Internet** estará disponible para la comunicación con el backend y la API de procesamiento de imágenes.  
- Se asume que los dispositivos cercanos participando en la localización también tienen la app instalada y ejecutándose.  

#### Dependencias
- **Backend NestJS**: la app depende del servidor para gestión de usuarios, almacenamiento y procesamiento de datos.  
- **MongoDB**: la app depende de la base de datos para persistencia de usuarios, dispositivos y medios.  
- **API Flask de procesamiento de imagen**: la app depende de la disponibilidad de esta API para funciones de análisis de imágenes.  
- **Bibliotecas de terceros**: React Native, librerías BLE, herramientas de UI y otras librerías usadas deben estar mantenidas y compatibles con el proyecto.  
- **Servicios de hosting / CDN**: se depende de la disponibilidad de la infraestructura de hosting (EC2 u otro) y del CDN para distribución de imágenes y medios.  

#### Nota
- La fiabilidad del sistema depende del correcto funcionamiento de estas dependencias.  
- Cambios en versiones de librerías, APIs o sistemas operativos pueden afectar la operación del producto.


### 2.6 Requesitos futuros

## 3. Requisitos específicos

### · 3.1 Interfaces externas

#### 3.1.1 Interfaces hardware

- **Dispositivos móviles compatibles**: teléfonos Android e iOS recientes que soporten React Native y BLE.  
- **Sensores requeridos**:  
  - Bluetooth Low Energy (BLE) para comunicación entre dispositivos.  
  - Acelerómetro, giroscopio y brújula (opcional, para mejorar la estimación de posición relativa).  
  - Cámara.  
- **Restricciones físicas**: la funcionalidad de localización depende de que los dispositivos estén dentro del rango de BLE (aprox. 10–30 metros).

#### 3.1.2 Interfaces software

- **Sistema operativo**: versiones recientes de Android e iOS (definir mínimas según pruebas).  
- **Frameworks y librerías**:  
  - React Native para la app móvil.  
  - NestJS para el backend.  
  - MongoDB como base de datos.  
  - Librerías BLE compatibles con React Native.  
  - Librerías de UI y utilidades necesarias.  
- **APIs externas**:  
  - API de procesamiento de imagen basada en Flask.  
  - Servicios de almacenamiento en CDN para imágenes y medios.  
  - Autenticación y comunicación con backend (REST/HTTP, JSON, JWT).  

#### 3.1.3 Interfaces de comunicación

- **Comunicación entre dispositivos**:  
  - BLE para intercambio de identificadores y RSSI entre dispositivos cercanos.  
- **Comunicación con servidores**:  
  - HTTP/HTTPS hacia backend NestJS.  
  - Formato de datos: JSON para solicitudes y respuestas.  
  - Autenticación: JWT o token de sesión para proteger las comunicaciones.  
- **Redes**: la funcionalidad depende de disponibilidad de red para acceder al backend.

### 3.2 Requisitos funcionales

#### 3.2.1  Backend : Módulo Auth 

**Propósito** : Autenticación y registro de usuarios

**Interacciones**: 
- Módulo User
- Páginas de frontend

**Funciones**:
- Registrar
- Iniciar sesión
- Permitir verificar si un usuario ya ha iniciado sesión

**Notas**: 
$Habrá que dar las opciones de autenticarse con tiktok/instagram/facebook/google.

#### 3.2.2  Backend : Módulo Bullet 

**Propósito** : Manejar los tipos de balas. 

**Interacciones**: 
- Página Join
- Página Game
- Módulo Shot
- Módulo Player

**Funciones**:
- Crear balas
- Borrar todas las balas
- Borrar bala por ID
- Actualizar valores de una bala
- Encontrar una bala por ID
- Obtener todas las balas

**Notas**:
Las balas definen el daño que hace un disparo (Módulo Shot). Tienen un precio, un nombre que actúa como identificador y un multiplicador de daño. La edición, creación y borrado lo harán los admins de facehunter, los usuarios solo accederán a los datos de los elementos existentes.

#### 3.2.3  Backend : Módulo Comment

**Propósito** : Gestionar los comentarios de usuarios en los Facehunts

**Interacciones**:
- Módulo Facehunt
- Módulo Usuario

**Funciones**:
- Crear comentario
- Borrar todos los comentarios
- Obtener todos los comentarios
- Encontrar un comentario por ID
- Borrar un comentario por ID
- Actualizar un comentario por ID
- $Encontrar todos los comentarios de un facehunt

**Notas**:
Un comentario contendrá un mensaje, el ID del autor del comentario, y el ID del Facehunt donde el comentario fue hecho.

#### 3.2.4  Backend : Módulo Facehunt

**Propósito** : Gestionar los facehunts

**Interacciones**:
- Página Facehunt
- Página Index
- Módulo User
- Módulo Like

**Funciones**:
- Crear 
- Borrar todos
- Obtener todos
- Obtener por ID
- Borrar por ID
- Actualizar por ID

**Notas**:
El facehunt tiene un nombre que puede ser opcional, el autor del facehunt, el juego donde se hizo y la imagen asociada al mismo.

#### 3.2.5  Backend : Módulo Game

**Propósito** : Manejar el estado del juego (si ha terminado o no, y los jugadores que hay)
**Interacciones**: 
- Página Game
- Página Join
- Página Create
- Módulo User
- Módulo Player
- Módulo Weapon
- Módulo Gamemode
- Módulo Shot
- Módulo Role
- Módulo Localización

**Funciones**:
- Crear 
- Borrar todos
- Obtener todos
- Obtener por ID
- Borrar por ID
- Actualizar por ID
- Añadir jugador
- Websocket : Eventos de disparos que actualizan el estado del juego y envían mensajes a todos. También calcula los efectos del disparo y lo crea, a partir de un ID de usuario, imagen y bala. $Quizás habrá que añadir también campo para que acepte el tipo de arma. $Tendrá también que comunicarse con el módulo de localización para identificar el objetivo.
- Websocket : Votación de los mejores disparos
- Websocket : Detección de cuando la votación ha terminado

**Notas**:
Para crear un juego solo se necesita el tipo de juego y un identificador. ~Más adelante se puede poner opciones avanzadas como límite de jugadores o la opción de notificar a amigos. Un juego tendrá una lista de jugadores y una variable que guardará si ha terminado o no.

#### 3.2.6  Backend : Módulo Gamemode

**Propósito** : Permitir la creación de distintos modos de juego

**Interacciones**: 
- Módulo Game
- Página Create

**Funciones**:
- Crear 
- Borrar todos
- Obtener todos
- Obtener por ID
- Borrar por ID
- Actualizar por ID

**Notas**:
Un modo de juego tendrá un nombre, número de rodas y la duración en segundos de cada ronda. También tendrá los valores opcionales de equipos, y límite de jugadors. La edición, creación y borrado lo harán los admins de facehunter, los usuarios solo accederán a los datos de los elementos existentes.

#### 3.2.7  Backend : Módulo Like

**Propósito** : Gestionar los likes que hacen los usuarios a un facehunt.

**Interacciones**: 
- Módulo User
- Módulo Facehunt

**Funciones**:
- Crear 
- Borrar todos
- Obtener todos
- Obtener por ID
- Borrar por ID
- Actualizar por ID
- Checkear si un usuario ha dado like a un post
- Obtener objeto Like a partir de ID del autor y ID del facehunt

**Notas**:
El like sirve como objeto que une autor y facehunt. Puede tener valor de True (le ha dado like), o False (le dio like, pero luego lo canceló).

#### 3.2.8  Backend : Módulo Message

**Propósito** : Gestión de mensajes directos entre usuarios

**Interacciones**: 
- Módulo User
- Página Chat

**Funciones**:
- Crear 
- Borrar todos
- Obtener todos
- Obtener por ID
- Borrar por ID
- Actualizar por ID
- Obtener N mensajes de un chat
- Markar mensaje como leído
- Websocket : Unirse a un chat y obtener los datos del mismo
- Websocket : Envío de mensajes directos
- Websocket : Marcar cuando se ha leído y/o recibido un mensaje

**Notas**:
Todo mensaje tendrá un contenido, ID de usuario emisor e ID de usuario  receptor. Tendrán otro atributo que guardará su estado (enviado, recibido, leído). 

#### 3.2.9  Backend : Módulo Player

**Propósito** : Gestión de jugadores, entidades que participan en los juegos.

**Interacciones**: 
- Módulo Game
- Página Join
- Módulo User
- Módulo Bullet
- Módulo Weapon
- Módulo Role
- Módulo Shot

**Funciones**:
- Crear 
- Borrar todos
- Obtener todos
- Obtener por ID
- Borrar por ID
- Actualizar por ID

**Notas**:
Usuarios registrados y anónimos pueden tener un jugador. Es lo que permite que un jugador anónimo pueda jugar. Por supuesto, si está registrado el jugador estará marcado como jugador. La entidad de jugador actúa como contendor de datos de la persona que está jugando, y tendrá los datos de : usuario(opcional), juego, arma, balas, rol, vida restante y créditos. En modos de juego donde el arma, balas, rol, o vida no sean relevantes se pondrán valores por defecto.

#### 3.2.10 Backend : Módulo Role

**Propósito** : Módulo que permite crear entidades que almacenan atributos generales.

**Interacciones**: 
- Módulo Player
- Módulo Game
- Página Join

**Funciones**:
- Crear 
- Borrar todos
- Obtener todos
- Obtener por ID
- Borrar por ID
- Actualizar por ID

**Notas**:
El rol de momento solo tendrá un nombre y la vida. ~Sin embargo depende del rol se pueden booster algunas recompensas, descuentos en ciertos tipos de armas, aportando así variedad. La edición, creación y borrado lo harán los admins de facehunter, los usuarios solo accederán a los datos de los elementos existentes.

#### 3.2.11 Backend : Módulo Shot

**Propósito** : Módulo que gestiona los disparos en un juego

**Interacciones**: 
- Módulo Game
- Módulo Player
- Página Game
- Módulo Reconocimiento de Imagen
- Módulo Localización

**Funciones**:
- Crear 
- Borrar todos
- Obtener todos
- Obtener por ID
- Borrar por ID
- Actualizar por ID
- Validar imagen
- Obtener disparos del juego

**Notas**:
Un disparo tiene el ID de un autor, el ID de la partida, y el ID del objetivo. Tendrá otro campo que definirá si es válido o no. La validez se hace mediante el módulo de Reconocimiento de Imagen. ~Se puede añadir más metadata para que de un valor de éxito continuo del 0 al 1.0 en función de la parte del cuerpo, usando el módulo de Reconocimiento de Imagen (modo hunt).

#### 3.2.12 Backend : Módulo User

**Propósito** : Módulo que gestiona los usuarios, aquellos que están registrados.

**Interacciones**: 
- Módulo Auth
- Página Chat
- Página Facehunt
- Módulo Facehunt
- Módulo Like
- Módulo Comment
- Módulo Player
- Página Index

**Funciones**:
- Crear 
- Borrar todos
- Obtener todos
- Obtener por ID
- Borrar por ID
- Actualizar por ID
- Obtener por email

**Notas**:
~Habrá que añadir la opción de que haya usuarios premium, y más opciones cosméticas a parte de la foto de perfil. ~Banner, iconos y emoticonos.

#### 3.2.13 Backend : Módulo Weapon

**Propósito** : Gestionar las armas que se usan en el juego

**Interacciones**: 
- Página Join
- Módulo Player
- Módulo Game
- Módulo Shot

**Funciones**:
- Crear 
- Borrar todos
- Obtener todos
- Obtener por ID
- Borrar por ID
- Actualizar por ID

**Notas**:
De mmomento tendrá un nombre, cuantas balas puede tener, tiempo de recarga, nivel de zoom y ~opcionalmente skin y efecto de sonido al disparar. La edición, creación y borrado lo harán los admins de facehunter, los usuarios solo accederán a los datos de los elementos existentes.


#### 3.2.13 Backend : Módulo Reconocimiento de Imagen

**Propósito** : Validar los facehunts que se toman durante la partida

**Interacciones**: 
- Módulo Game
- Módulo Shot

**Funciones**:
- Validar e identificar la cara del usuario
- $Habrá que añadir una manera de registar la cara, quizas con la foto de perfil o un campo extra en el usuario
- Verificar que parte del cuerpo ha sido el disparo (modo hunt)

**Notas**:
Será un módulo en otra backend distinta, de Flask que usará una librería basada en C++ para el reconocimiento de imagen.

#### 3.2.14 Frontend : Página Index

**Propósito** : Página inicial de la app

**Interacciones**: 
- Módulo Facehunt
- Módulo Auth
- Módulo User
- Página Friends
- Página Settings
- Página Account
- Página Facehunt
- Página Create
- Página Join

**Funciones**:
- Proporcionar manera de ir al resto de páginas
- Poder registrarse/autenticarse
- Si estás autenticado, ver los últimos facehunts

**Notas**:
Elementos de UI:
- Feed
- TaskBar
- DeepButton

#### 3.2.15 Frontend : Página Settings

**Propósito** : Gestionar las configuraciones del usuario

**Interacciones**: 

**Funciones**:

**Notas**:
Elementos de UI:

#### 3.2.16 Frontend : Página Account

**Propósito** : Gestionar los detalles de la cuenta

**Interacciones**: 

**Funciones**:

**Notas**:
Elementos de UI:

#### 3.2.17 Frontend : Página Friends

**Propósito** : Gestionar los amigos añadidos

**Interacciones**: 
- Página Chat
- Módulo User

**Funciones**:
- Poder ir al chat con un amigo
- Poder bloquear a un amigo, eliminandolo de la lista

**Notas**:
Elementos de UI:
- FriendCard
- GoBackButton

#### 3.2.18 Frontend : Página Facehunt

**Propósito** : Página para ver un facehunt en detalle

**Interacciones**: 
- Módulo Facehunt
- Módulo Comment
- Módulo Like
- Módulo User

**Funciones**:
- Ver un facehunt específico
- Dar o quitar like
- Ver comentarios
- Comentar

**Notas**:
Elementos de UI:
- GoBackButton
- Comment
- Keyboard
- FacehuntContainer
~Quizás eliminearlo e integrarlo en index.tsx para que sea un SPA, pero requerirá más ingeniería.

#### 3.2.19 Frontend : Página Create

**Propósito** : Página de creación de partida

**Interacciones**: 
- Módulo Game
- Módulo Gamemode

**Funciones**:
- Crear una partida
- Decidir el modo de juego
- Poder unirse uno mismo
- Generar código QR del identificador de la partida

**Notas**:
Elementos de UI:
- CreateAfter
- DeepButton
- AdvancedCreateOptions
- GamemodeList
- GoBackButton

#### 3.2.20 Frontend : Página Join 

**Propósito** : Poder unirse a una partida

**Interacciones**: 
- Módulo Player
- Módulo Game
- Módulo Bullet
- Módulo Weapon
- Módulo Role

**Funciones**:
- Escanear QR para obtener identificador de la partida
- Elegir rol, arma y comprar balas
- Poder ver los créditos que tienes disponibles
- $Poder ver las balas que tienes disponibles
- Poder ver cuantos jugadores se han unido y cuantos faltan
- Poder unirse 

**Notas**:
Elementos de UI:
- ScanQR
- JoinOptions
- PlainButton

#### 3.2.21 Frontend : Página Game

**Propósito** : Poder jugar

**Interacciones**: 
- Módulo Game
- Módulo Localización
- Módulo Player
- Módulo Facehunt
- Módulo Bullet
- Módulo Rol
- Módulo Weapon
- Módulo Gamemode

**Funciones**:
- Poder ver cuantos jugadores hay y cuales están eliminados
- Notificaciones cuando un jugador ha sido eliminado
- Número de ronda, y tiempo restante
- Poder disparar
- Ver las balas y arma disponible
- Ver vida restante 
- Mirilla dependiendo del arma
- Poder votar los mejores facehunts
- Tabla de puntuaciones

**Notas**:
Elementos de UI:
$

#### 3.2.22 Frontend : Página Chat

**Propósito** : Intercambiar mensajes directos entre usuarios

**Interacciones**: 
- Módulo Message
- Módulo User

**Funciones**:
- Poder mandar y recibir mensajes con un usuario
- Ver si ha llegado, o el mensaje ha sido leído

**Notas**:
Elementos de UI:
- Keyboard
- MessagesList
- ChatHeader
- GoBackButton

#### 3.2.23 Frontend : Módulo Localización

**Propósito** : Poder triangular la posición relativa de los otros jugadores

**Interacciones**: 
- Módulo Game

**Funciones**:
- Identificar la posición relativa de otros jugadores usando una variante del algoritmo EKF.

**Notas**:
El funcionamiento de este módulo se basea en módulos nativos de Swift (ios) y Kotlin (android) que emiten un identificador único via BLE (blueetooth). Cada dispositivo entonces capta la distancia a cada otro dispositivo, y envían esa información al servidor, que hace los cálculos necesarios y envía los resultados a los dispositivos conectados. Los dispositivos de esta manera no solo saben la distancia a la que están a cada dispositivo, sino el ángulo también. La distancia es también corregida gracias a que hay más medidas de las que la que un dispositivo solo puede generar. El algoritmo aplicaría alguna manera de calcular la varianza. Para hacer la medida más precisa, se toman varias medidas RSSI y se calcula la mediana para reducir el efecto de valores atípicos o ruido. 

La aproximación mediante EKF tratará de hacer más precisas estos resultados si es que no lo son lo suficiente. La manera en la que lo hará será almacenando un historial de posiciones relativas de los demás. Luego, con los sensores de movimiento del dispositivo propio se trata de predecir la nueva posición relativa. Estos datos deben ser enviados al servidor previamente que contrasta los valores de todos los dispositivos para dar una predicción lo más precisa posible. A continuación se combinan estas predicciones con las nuevas mediciones BLE para actualizar la posición estimada de los dispositivos cercanos.

Este proceso es similar a un Filtro de Kalman Extendido. 

### 3.3 Requisitos de rendimiento

- Las actualizaciones de posiciones deben de realizarse en menos de 100 ms
- El tiempo de respuesta del backend en los módulos que no tengan que ver con el disparo de be ser menos de 300 ms bajo carga normal. El disparo debe dar una respuesta del backend en ~200ms o menos.
- El sistema debe soportar al menos 10000 usuarios concurrentses sin que haya problemas de rendimiento.
- Las consultas generales a la base de datos (comentarios, facehunts, likes ... ) deben dar resultados en menos de 500 ms

### 3.4 Requisitos lógicos de la base de datos

**Estructura conceptual**:

- Bullet   : name, price, dmgMul
    Bullet -> Player

- Comment  : content, author, facehunt
    Comment -> Facehunt

- Facehunt : name?, author, game, image
    Facehunt -> User
    Facehunt -> Game

- Game     : identifier, ended, players, gameType
    Game <-> Gamemode

- Gamemode : name,  numRounds, roundLength, teams?, teamLimit?
    Game <-> Gamemode

- Like     : author, value, facehunt
    Like -> User 
    Like -> Facehunt

Message  : status, content, sender, receipt
    Message -> User

Player   : user, game, weapon, bullets, role, remainingHP, shots, credits
    Player -> Game
    Player -> User
    Player <-> Weapon
    Bullet <-> Player
    Player <-> Role 
    Player <-> Shot

Role     : name, baseHP
    Role <-> Player

Shot     : valid, author, game, votes, target, image
    Shot -> Game
    Shot <-> Player

~User    : name?, profilePic?, comments, likees, messages, username, email, friends, credits, password, roles
    
Weapon   : name, capacity, relaodTime, zoom, skin, sound
    Weapon <-> Player

### 3.5 Restricciones de diseño

- Uso obligatorio de React Native para frontend.
- Dependencia de BLE para el módulo de localiación
- Compatibilidad multiplataforma: Android e IOS.
- API de procesamiento de imagen basada en Flask.
- CDN para imágenes y hosting escalable.
- ~Las transacciones monetarias se harán con la API de Stripe

### 3.6 Atributos del sistema software

- Seguridad mediante la autenticación con JWT
- Manejo de errores
- Interfaz clara y adictiva
- Código modular con arquitectura multicapa mantenido y actualizado con git

### 3.7 Otros requisitos

- Soporte para múltiples idiomas
- Privacidad y legal: Consentimiento para usar BLE, cámara, sensores y los demás datos que se utilizarán el la app.

## 4. Apéndices
~
