// Spanish dictionary with 2000 common words
// Based on LibreOffice dictionaries from https://github.com/LibreOffice/dictionaries/blob/master/es
const spanishDictionary = [
    // Common Spanish words (2000 words)
    "abajo", "abandono", "abrir", "absoluto", "abuelo", "acabar", "academia", "acaso", "acceso", 
    "acción", "aceite", "aceptar", "acerca", "acercar", "acompañar", "acordar", "acto", "actitud", "actividad", 
    "acto", "actual", "actuar", "acudir", "acuerdo", "adaptar", "adelante", "además", "adecuado", "administración", 
    "admitir", "adoptar", "adquirir", "advertir", "afectar", "afirmar", "agua", "agudo", "ahí", "ahora", 
    "aire", "ala", "alcanzar", "alegría", "alejar", "alemán", "algo", "alguien", "algún", "alimentar", 
    "allá", "allí", "alma", "almorzar", "alrededor", "alterar", "alto", "altura", "amar", "ambas", 
    "ambiente", "ambos", "amenaza", "americano", "amigo", "amor", "amplio", "ancho", "andar", "ángel", 
    "animal", "anoche", "ante", "anterior", "antes", "antiguo", "anunciar", "análisis", "añadir", "año", 
    "aparecer", "apartar", "aparte", "apenas", "apoyar", "aprender", "aprovechar", "aproximar", "aquel", "aquí", 
    "ara", "árbol", "arma", "arrancar", "arreglar", "arriba", "arte", "artículo", "artista", "asegurar", 
    "así", "aspecto", "asunto", "asumir", "atacar", "atención", "atender", "atrás", "atreverse", "aumentar", 
    "aun", "aunque", "autor", "autonomía", "avanzar", "aves", "ayer", "ayuda", "ayudar", "azul", 
    "añadir", "año", "aún", "bailar", "bajar", "bajo", "balance", "banca", "banco", "banda", 
    "baño", "bar", "barco", "barrio", "base", "básico", "bastante", "bastar", "batalla", "batir", 
    "bebé", "beber", "bello", "besar", "bien", "blanco", "boca", "bosque", "brazo", "breve", 
    "brillar", "broma", "bueno", "buscar", "caballero", "caballo", "cabeza", "cabo", "cada", "cadena", 
    "caer", "café", "caja", "calle", "calor", "callar", "cama", "cambiar", "cambio", "caminar", 
    "camino", "campaña", "campo", "canción", "cansado", "cantar", "cantidad", "capaz", "capital", "cara", 
    "característica", "cargo", "carne", "carrera", "carta", "carácter", "casa", "casar", "casi", "caso", 
    "catalán", "causa", "celebrar", "central", "centro", "cerebro", "cerrar", "certeza", "chica", "chico", 
    "cielo", "ciencia", "científico", "cien", "cierto", "cinco", "cine", "circunstancia", "citar", "ciudad", 
    "ciudadano", "civil", "claro", "clase", "clave", "cliente", "clima", "club", "cobrar", "coger", 
    "colocar", "color", "comentar", "comenzar", "comer", "comercial", "comercio", "cometer", "como", "compañero", 
    "compañía", "comparar", "compartir", "complejo", "completar", "completo", "complicado", "componente", "componer", "comprar", 
    "comprender", "comprobar", "compromiso", "común", "comunicación", "comunidad", "con", "concepto", "conciencia", "concierto", 
    "concluir", "concretar", "condición", "conducir", "conducta", "conectar", "conferencia", "confianza", "confirmar", "conflicto", 
    "conjunto", "conocer", "conocimiento", "conseguir", "consejo", "conservar", "considerar", "consistir", "constante", "constituir", 
    "constitución", "construcción", "construir", "consultar", "consumir", "consumo", "contacto", "contar", "contemplar", "contener", 
    "contenido", "contento", "contexto", "continuar", "contra", "contrato", "contrario", "control", "controlar", "convencer", 
    "convenir", "conversación", "convertir", "corazón", "correr", "corresponder", "corriente", "cortar", "corto", "cosa", 
    "costa", "crear", "crecer", "creer", "crisis", "criterio", "crítica", "cruzar", "cuadro", "cual", 
    "cualidad", "cualquier", "cuando", "cuanto", "cuarto", "cuatro", "cubrir", "cuenta", "cuerpo", "cuestión", 
    "cultura", "cultural", "cumplir", "curar", "curso", "cuya", "cuyo", "cuál", "cuándo", "cuánto", 
    "cómo", "dar", "dato", "de", "deber", "debido", "decidir", "decisión", "decir", "declarar", 
    "dedicar", "dedo", "defender", "defensa", "definir", "definitivo", "dejar", "del", "delante", "demasiado", 
    "democracia", "demostrar", "demás", "denunciar", "depender", "derecha", "derecho", "derivar", "desarrollo", "desaparecer", 
    "descansar", "descender", "descubrir", "desde", "desear", "deseo", "deshacer", "deslizar", "desocupar", "destacar", 
    "destino", "destruir", "detalle", "detener", "determinar", "día", "diario", "dibujar", "dibujo", "diciembre", 
    "dictadura", "dieciocho", "diente", "diferencia", "diferente", "difícil", "dignidad", "digno", "dime", "dinero", 
    "dios", "dirección", "directo", "director", "dirigir", "disponer", "distancia", "distinto", "diverso", "dividir", 
    "división", "divulgar", "doble", "doce", "doctor", "documento", "dolor", "domingo", "dominar", "dominio", 
    "don", "donde", "dorado", "dormir", "dos", "doscientos", "doña", "droga", "duda", "dudoso", 
    "dulce", "durante", "duro", "dárselo", "débil", "décimo", "día", "días", "dónde", "e", 
    "económico", "edad", "edificio", "editar", "educación", "efecto", "efectuar", "eficaz", "ejercer", "ejercicio", 
    "ejército", "el", "elección", "electo", "elegir", "elemento", "elevar", "eliminar", "ella", "ello", 
    "embargo", "embarque", "emisión", "emitir", "emoción", "empezar", "empresa", "en", "enamorar", "encaminarse", 
    "encargar", "encima", "encontrar", "encuentro", "enemistad", "enero", "enfadar", "enfermedad", "enfermo", "enfrentar", 
    "engañar", "enlace", "enorme", "enriquecer", "enseñar", "entender", "enterar", "entonces", "entrada", "entrar", 
    "entre", "entregar", "entretener", "entrevista", "entusiasmado", "enviar", "envolver", "episodio", "equilibrio", "equipo", 
    "equivocación", "error", "es", "esa", "escala", "escapar", "escena", "escoger", "escolar", "escribir", 
    "escritor", "escuchar", "escuela", "ese", "esfuerzo", "eso", "espacio", "espalda", "españa", "español", 
    "especial", "especie", "específico", "espectáculo", "esperanza", "esperar", "espíritu", "espléndido", "esposa", "esposo", 
    "esquina", "esta", "estable", "establecer", "estado", "estadounidense", "estar", "estatua", "este", "estilo", 
    "estirar", "esto", "estrechar", "estrella", "estructura", "estudiar", "estudio", "estudiante", "etapa", "eterno", 
    "europeo", "evidente", "evitar", "exactamente", "examen", "examinar", "excelente", "excepción", "exceso", "excitar", 
    "exclusivo", "excusa", "exigir", "existencia", "existir", "exitoso", "experiencia", "experimentar", "explicar", "explotar", 
    "exponer", "expresar", "expresión", "extender", "extensión", "exterior", "externo", "exranjero", "extraño", "extremo", 
    "fabricar", "facilidad", "facilitar", "factor", "facultad", "falda", "falta", "faltar", "fama", "familia", 
    "familiar", "famoso", "fantasía", "farmacia", "fase", "favor", "favorecer", "fe", "fecha", "felicidad", 
    "feliz", "femenino", "fenómeno", "feo", "feria", "festival", "fiable", "ficha", "fiel", "fiesta", 
    "figura", "fijar", "fila", "filosofía", "filtrar", "fin", "final", "financiero", "fino", "firma", 
    "firme", "fiscal", "físico", "flor", "fluir", "fondo", "forma", "formación", "formar", "foro", 
    "fortalecer", "fortuna", "foto", "fracasar", "fracaso", "fragmento", "francés", "franja", "frase", "frecuencia", 
    "frecuente", "frenar", "frente", "fresco", "frío", "frontera", "frutas", "fuego", "fuente", "fuera", 
    "fuerte", "fuerza", "función", "funcionar", "fundamental", "fundar", "fundo", "futuro", "fábrica", "fácil", 
    "fórmula", "físico", "ganar", "ganas", "garantizar", "garras", "gas", "gastar", "gasto", "gato", 
    "gemelo", "general", "generar", "gente", "gesto", "gigante", "gimnasio", "girar", "global", "globo", 
    "gloria", "gobierno", "golpe", "gordo", "gota", "grabación", "grabar", "gracia", "grado", "grama", 
    "gramática", "gran", "grande", "grave", "griego", "gris", "gritar", "grito", "grupo", "guapo", 
    "guardar", "guerra", "guerrilla", "guiar", "guión", "gustar", "gusto", "haber", "habitación", "habitual", 
    "hablar", "hacer", "hacia", "hacienda", "hambre", "hasta", "hecho", "herida", "hermana", "hermano", 
    "hermoso", "heroico", "hielo", "hierba", "hijo", "historia", "histórico", "hogar", "hoja", "hola", 
    "hombre", "hombro", "hondureño", "honesto", "honor", "honra", "hora", "horizonte", "horrible", "hotel", 
    "hoy", "hueco", "huella", "hueso", "humano", "humor", "hundir", "huracán", "hábil", "hábito", 
    "húmedo", "icono", "ida", "idea", "ideal", "identificar", "identidad", "ideología", "idioma", "iglesia", 
    "ignorar", "igual", "igualdad", "ilegal", "imagen", "imaginar", "imitar", "impacto", "impedir", "imperio", 
    "imponer", "importancia", "importante", "importar", "imposible", "impresión", "impresionante", "impuesto", "impulsar", "impulso", 
    "incapaz", "incendio", "incertidumbre", "inclinar", "incluir", "incluso", "inconveniente", "incorporar", "incrementar", "increíble", 
    "indicar", "indicio", "indígena", "individuo", "industria", "inevitable", "infantil", "inferior", "infinito", "influencia", 
    "influir", "información", "informar", "informe", "ingeniero", "iniciar", "inicio", "injusticia", "inmenso", "inmigración", 
    "innovación", "inocente", "inquieto", "inscribir", "insistir", "inspección", "instalar", "instante", "instinto", "institución", 
    "instrumento", "integral", "integrar", "inteligencia", "inteligente", "intención", "intensidad", "intenso", "intentar", "intento", 
    "interesar", "interés", "interior", "internacional", "internet", "interpretar", "intervención", "intervenir", "introducir", "inundar", 
    "inútil", "invasión", "inventar", "inversor", "investigación", "investigar", "invierno", "invitar", "ir", "irlanda", 
    "ironía", "irregular", "isla", "israelí", "italiano", "izquierda", "jardín", "jefe", "jerarquía", "jornada", 
    "joven", "juego", "jugador", "jugar", "juicio", "julio", "junio", "juntar", "junto", "jurar", 
    "justicia", "justificar", "juzgar", "juventud", "kilómetro", "labio", "labor", "laboratorio", "labrar", "lado", 
    "ladrón", "laguna", "lamentar", "lanza", "lanzar", "lapso", "largo", "lastimar", "latido", "latino", 
    "lavar", "lazo", "leal", "lector", "lectura", "legal", "legislación", "legítimo", "lejano", "lejos", 
    "lema", "lengua", "lenguaje", "lentamente", "lento", "lesión", "letra", "levantar", "leve", "ley", 
    "liberación", "liberal", "liberar", "libertad", "libre", "libro", "licencia", "líder", "liderar", "limitado", 
    "limitar", "limite", "limpio", "línea", "listo", "literatura", "llama", "llamar", "llanto", "llave", 
    "llegar", "llenar", "lleno", "llevar", "llorar", "lluvia", "lo", "local", "loco", "lograr", 
    "logro", "lomo", "londinense", "lucha", "luchar", "lugar", "lujo", "luz", "lágrima", "lápiz", 
    "líder", "límite", "línea", "lógica", "lógico", "madera", "madre", "madrileño", "maduro", "maestro", 
    "magia", "magistrado", "magnífico", "mal", "maldad", "maldito", "malo", "mamá", "mandar", "manejo", 
    "manera", "manifestación", "manifestar", "maniobra", "mano", "manojo", "mantener", "mañana", "mapa", "maquina", 
    "mar", "maravilla", "marcar", "marcha", "marchar", "marco", "marea", "margen", "marido", "marino", 
    "marrón", "martillo", "más", "masa", "matar", "mate", "material", "materia", "matrimonio", "matriz", 
    "máximo", "mayor", "mayoría", "media", "mediante", "medicina", "medida", "medio", "mediodía", "medir", 
    "mejor", "mejorar", "memoria", "menor", "menos", "mensaje", "menú", "mercado", "merecer", "mes", 
    "mesa", "meter", "metro", "mexicano", "mezcla", "mezclar", "miedo", "miembro", "mientras", "milagro", 
    "militar", "millón", "minuto", "mirada", "mirar", "misa", "miseria", "misión", "mismo", "mitad", 
    "mito", "mocedad", "moda", "modelo", "moderno", "modificar", "modo", "mojado", "momento", "moneda", 
    "montaña", "montar", "moral", "morir", "mostrar", "motivo", "motor", "mover", "movimiento", "muchacha", 
    "muchacho", "muchísimo", "mucho", "muerto", "muestra", "muerte", "mujer", "mundial", "mundo", "municipal", 
    "muralla", "músculo", "música", "musical", "muy", "máquina", "más", "máximo", "método", "mínimo", 
    "móvil", "música", "nacer", "nacional", "nada", "nadar", "nadie", "naranja", "nariz", "narrar", 
    "naturaleza", "natural", "navidad", "necesario", "necesidad", "necesitar", "negar", "negociar", "negocio", "negro", 
    "nervio", "nervioso", "nevar", "ni", "nido", "niebla", "nieto", "ningún", "ninguno", "niña", 
    "niño", "nivel", "no", "noche", "nombrar", "nombre", "norma", "normal", "norte", "noruego", 
    "nota", "notar", "noticia", "novedad", "novela", "noviembre", "novio", "nube", "nuestro", "nueva", 
    "nueve", "nuevo", "número", "nunca", "nutrir", "o", "objetivo", "objeto", "obligación", "obligar", 
    "obra", "obrero", "observar", "obsesión", "obstáculo", "obtener", "obvio", "ocasión", "ocasionar", "occidental", 
    "océano", "ocurrir", "odiar", "odio", "oeste", "ofender", "oficial", "oficina", "ofrecer", "oído", 
    "oír", "ojo", "olvidar", "olvido", "operación", "opinar", "opinión", "oponente", "oponer", "oportunidad", 
    "oposición", "oprimir", "optar", "optimista", "orden", "ordenador", "ordinario", "organismo", "organización", "organizar", 
    "orgullo", "orientar", "origen", "original", "orillar", "oro", "orquesta", "os", "oscuridad", "oscuro", 
    "otorgar", "otro", "otoño", "padecer", "padre", "pagar", "página", "país", "paja", "pájaro", 
    "palabra", "palacio", "palma", "palo", "paloma", "pan", "panadero", "pantalla", "pantalón", "papa", 
    "papel", "paquete", "par", "para", "parada", "paradoja", "paraguas", "parar", "parcela", "parecer", 
    "pared", "pareja", "parlamentario", "parque", "parte", "participación", "participar", "particular", "partido", "partir", 
    "pasado", "pasar", "pasear", "paseo", "pasillo", "pasión", "paso", "pasta", "pastor", "patata", 
    "paterno", "patria", "patrimonio", "patrón", "paz", "país", "pedir", "pegar", "peinado", "pelar", 
    "pelea", "pelear", "peligro", "peligroso", "pelo", "pelota", "pena", "pendiente", "penetrar", "pensamiento", 
    "pensar", "peor", "pequeño", "percibir", "perder", "pérdida", "perfecto", "perfil", "periodista", "periódico", 
    "permanecer", "permitir", "pero", "perpetuo", "perro", "perseguir", "persona", "personaje", "personal", "pertenecer", 
    "pesar", "pesca", "peso", "pestaña", "petición", "petróleo", "pico", "pie", "piedra", "piel", 
    "pierna", "pieza", "pinchar", "pintor", "pintura", "pipa", "pirata", "pisar", "piscina", "piso", 
    "pista", "pizca", "placer", "plan", "plancha", "planeta", "planificar", "planta", "plantear", "plata", 
    "plátano", "playa", "plaza", "plazo", "pleno", "pluma", "plural", "población", "pobre", "poco", 
    "poder", "poderoso", "poema", "poesía", "poeta", "policía", "política", "político", "pollo", "polvo", 
    "poner", "popular", "por", "porcentaje", "portada", "portal", "porte", "portero", "poseer", "posibilidad", 
    "posible", "posición", "positivo", "postal", "potencia", "pozo", "práctica", "precio", "precioso", "precipicio", 
    "preciso", "preferir", "pregunta", "preguntar", "premio", "prensa", "preocupación", "preocupar", "preparar", "presencia", 
    "presentar", "presente", "preservar", "presidente", "presión", "preso", "prestar", "prestigio", "presumir", "pretender", 
    "prevenir", "prever", "previo", "primavera", "primer", "primero", "primo", "principal", "principio", "prioridad", 
    "prisa", "prisión", "privado", "probar", "problema", "proceder", "proceso", "proclamar", "producción", "producir", 
    "producto", "productor", "profesional", "profesor", "profundidad", "profundo", "programa", "progreso", "prohibir", "prometer", 
    "promover", "pronto", "propietario", "propio", "proponer", "proporcionar", "propuesta", "propósito", "protección", "proteger", 
    "proyecto", "prueba", "público", "pueblo", "puente", "puerta", "puerto", "puesto", "pulgar", "pulmón", 
    "punta", "punto", "puñal", "puro", "que", "quedar", "queja", "quejar", "quemar", "querer", 
    "quién", "química", "químico", "quince", "quitar", "quizá", "quizás", "qué", "radio", "raíz", 
    "rama", "ramo", "rapidez", "rápido", "rato", "rayo", "razón", "razonable", "reaccionar", "reacción", 
    "realidad", "realizar", "realmente", "rebelde", "recibir", "reciente", "reclamar", "recoger", "recomendar", "reconocer", 
    "recordar", "recorrer", "recreo", "rectificar", "recuerdo", "recuperar", "recurso", "red", "reducir", "referencia", 
    "referir", "reflexión", "reforma", "refugio", "regalar", "regalo", "registrar", "registro", "regla", "regresar", 
    "regular", "reina", "reino", "reír", "relación", "relacionar", "relatar", "religión", "religioso", "reloj", 
    "remediar", "remedio", "repetir", "reposar", "representante", "representar", "reproducir", "república", "reserva", "reservar", 
    "residencia", "resistencia", "resistir", "resolver", "respecto", "respetar", "respeto", "respirar", "responder", "responsabilidad", 
    "responsable", "respuesta", "restaurante", "resto", "resultado", "resultar", "resumen", "resumir", "retener", "retirar", 
    "retorno", "retraso", "reunión", "reunir", "revelar", "revista", "revolución", "revuelta", "rey", "rezar", 
    "rico", "riesgo", "riguroso", "rincón", "ritmo", "rivalidad", "robar", "robo", "roca", "rodear", 
    "rodilla", "rogar", "rojo", "romano", "romper", "ropa", "rosa", "rostro", "roto", "rubio", 
    "rueda", "ruido", "rumbo", "rumor", "rural", "ruso", "ritmo", "río", "rápido", "régimen", 
    "saber", "sabiduría", "sabor", "sacar", "sacrificar", "sacrificio", "sacudir", "sala", "salario", "salida", 
    "salir", "saltar", "salud", "saludar", "saludo", "salón", "salvar", "sangre", "sano", "santo", 
    "satisfacción", "satisfacer", "seco", "secretario", "secreto", "sector", "secuencia", "secundario", "sed", "seda", 
    "seguimiento", "seguir", "según", "seguridad", "seguro", "seis", "selección", "seleccionar", "selva", "semana", 
    "semejante", "semilla", "sencillo", "sensación", "sensible", "sentado", "sentencia", "sentido", "sentimiento", "sentir", 
    "separación", "separar", "septiembre", "sequía", "ser", "serie", "serio", "servicio", "servir", "sesenta", 
    "sesión", "sexo", "sexual", "señal", "señalar", "señor", "sí", "si", "siempre", "siendo", 
    "siete", "siglo", "significado", "significar", "siguiente", "silencio", "silla", "símbolo", "similar", "simple", 
    "simplemente", "sin", "sincero", "singular", "sino", "sintaxis", "sistema", "sitio", "situar", "sobre", 
    "sobrevivir", "social", "socialista", "sociedad", "socio", "sofocar", "sol", "solamente", "soldado", "soledad", 
    "solicitar", "solidaridad", "solo", "soltero", "solución", "sombra", "someter", "sonar", "sonido", "sonreír", 
    "sonrisa", "soñar", "soportar", "sorprender", "sorpresa", "sostenible", "suave", "subir", "súbito", "subrayar", 
    "subsistir", "suceder", "sucesión", "suceso", "suelo", "sueño", "suerte", "suficiente", "sufrir", "sugerir", 
    "suicidio", "sujetar", "sujeto", "suma", "sumar", "superar", "suponer", "surgir", "suroeste", "susceptible", 
    "suspender", "suspirar", "sostener", "suave", "subir", "suceder", "suelo", "sueño", "suficiente", "sufrir", 
    "sugerir", "sumar", "superar", "suponer", "sur", "surgir", "suspender", "suyo", "tabla", "tacto", 
    "tal", "talento", "tamaño", "también", "tampoco", "tan", "tanto", "tarde", "tarea", "tarjeta", 
    "taxi", "teatro", "techo", "técnica", "tecnología", "tejido", "tela", "teléfono", "tema", "temblor", 
    "temer", "temor", "temperatura", "temprano", "tendencia", "tender", "tener", "tensión", "tenso", "tentación", 
    "teología", "teoría", "terapia", "tercer", "tercero", "terminar", "termo", "ternura", "terreno", "terrible", 
    "territorio", "terror", "tesis", "tesoro", "testigo", "texto", "tiempo", "tienda", "tierra", "tigre", 
    "tijeras", "tímido", "tinto", "tipo", "típico", "tirar", "tiritar", "título", "tocar", "todavía", 
    "todo", "tomar", "tono", "tonto", "topar", "tormenta", "tornar", "toro", "torre", "tortura", 
    "total", "trabajador", "trabajar", "trabajo", "tradición", "traducción", "traducir", "traer", "tráfico", "tragar", 
    "traición", "traje", "tranquilidad", "tranquilo", "transformar", "transmitir", "transparente", "transporte", "tras", "trasladar", 
    "trastorno", "trata", "tratar", "través", "trayecto", "trazar", "treinta", "tren", "tres", "tribu", 
    "tribunal", "trigo", "triste", "tristeza", "triunfo", "trofeo", "tronco", "tropezar", "túnel", "turismo", 
    "turista", "turno", "tuyo", "técnica", "técnico", "término", "típico", "título", "último", "un", 
    "una", "único", "unidad", "unido", "unión", "unir", "universidad", "universitario", "uno", "urbano", 
    "urgencia", "urgente", "usar", "uso", "usual", "útil", "utilidad", "utilizar", "vacaciones", "vaciar", 
    "vacío", "vago", "valer", "validez", "valiente", "valor", "valorar", "válvula", "vanidad", "vapor", 
    "variable", "variado", "variar", "variedad", "vario", "varios", "vaso", "vecino", "vehículo", "veinte", 
    "vejez", "vela", "velocidad", "vena", "vencer", "venda", "vender", "veneno", "venganza", "venir", 
    "venta", "ventaja", "ventana", "ver", "verano", "verbal", "verdad", "verdadero", "verde", "vergüenza", 
    "verificar", "verso", "verter", "vestido", "vestir", "vez", "viaje", "viajar", "viajero", "víctima", 
    "vida", "vidrio", "viejo", "viento", "vientre", "vigilar", "vigor", "vincular", "vino", "violencia", 
    "violento", "viral", "virtud", "virus", "visión", "visitar", "vista", "visual", "vital", "viuda", 
    "vivir", "vivo", "vocabulario", "vocal", "vocación", "volar", "volcán", "voluntad", "volver", "votar", 
    "voto", "voz", "vuelo", "vuelta", "vulgar", "vulnerable", "válido", "vértice", "víctima", "vídeo", 
    "vínculo", "y", "ya", "yo", "yuca", "yugo", "zanahoria", "zapatilla", "zapato", "zona", 
    "zorro", "zumo", "ángel", "ángulo", "árbol", "área", "época", "ético", "órgano", "útil", 
    "ñoño", "ñandú"
];

// Export the dictionary
window.spanishDictionary = spanishDictionary; 