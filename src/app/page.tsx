"use client"

import { useState, useRef, useEffect } from "react"
import {
  Download,
  Search,
  Dumbbell,
  Zap,
  Droplets,
  Flame,
  Heart,
  Pill,
  Package,
  Coffee,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  LinkIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { jsPDF } from "jspdf"
import { obtenerTodosLosSuplementos, marcas, categorias, type CATEOGORIAS } from "@/lib/catalogo"
import Image from "next/image"
import Link from "next/link"

const url = "https://suplementosfitness.vercel.app"

// Custom styles for the table
const tableStyles = `
  .table-fixed {
    table-layout: fixed;
    width: 100%;
  }
  
  .table-fixed th,
  .table-fixed td {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

// Información de contacto de la tienda

const contactInfo = {
  phone: "+54 9 2494 46-8756",
  email: "mjmorazzo@gmail.com",
  whatsapp: "+54 9 2494 46-8756",
}

// Imágenes por defecto según categoría
const imagenesPorCategoria: Record<string, string> = {
  proteina: "/placeholder.svg?height=200&width=200&text=Proteina",
  creatina: "/placeholder.svg?height=200&width=200&text=Creatina",
  aminoacidos: "/placeholder.svg?height=200&width=200&text=Aminoacidos",
  "pre-entreno": "/placeholder.svg?height=200&width=200&text=Pre-Entreno",
  quemadores: "/placeholder.svg?height=200&width=200&text=Quemadores",
  vitaminas: "/placeholder.svg?height=200&width=200&text=Vitaminas",
  colageno: "/placeholder.svg?height=200&width=200&text=Colageno",
  ganador: "/placeholder.svg?height=200&width=200&text=Ganador",
  carbohidratos: "/placeholder.svg?height=200&width=200&text=Carbohidratos",
  barras: "/placeholder.svg?height=200&width=200&text=Barras",
  otros: "/placeholder.svg?height=200&width=200&text=Suplemento",
}

export default function CatalogoSuplementos() {
  // Estado para los filtros
  const [busqueda, setBusqueda] = useState("")
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<"todos" | CATEOGORIAS>("todos")
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("todos")
  const [ordenPrecio, setOrdenPrecio] = useState("ninguno")
  const [generandoPDF, setGenerandoPDF] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Estado para controlar qué ítems están expandidos en la vista móvil
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})

  // Referencias para las imágenes del PDF
  const imagenesRef = useRef<{ [key: number]: HTMLImageElement | null }>({})

  // Detectar si es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Obtener datos del catálogo
  const suplementos = obtenerTodosLosSuplementos()

  // Función para manejar la selección de marca con toggle
  const handleMarcaChange = (value: string) => {
    if (value === marcaSeleccionada) {
      setMarcaSeleccionada("todos")
    } else {
      setMarcaSeleccionada(value)
    }
  }

  // Filtrar suplementos según los criterios
  const suplementosFiltrados = suplementos
    .filter(
      (suplemento) =>
        suplemento.product.toLowerCase().includes(busqueda.toLowerCase()) ||
        suplemento.flavors.some((sabor) => sabor.toLowerCase().includes(busqueda.toLowerCase())),
    )
    .filter((suplemento) => categoriaSeleccionada === "todos" || suplemento.categoria === categoriaSeleccionada)
    .filter((suplemento) => marcaSeleccionada === "todos" || suplemento.brand === marcaSeleccionada)
    .sort((a, b) => {
      if (ordenPrecio === "ascendente") {
        return a.price - b.price
      } else if (ordenPrecio === "descendente") {
        return b.price - a.price
      }
      return 0
    })

  // Función para formatear el precio
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  // Función para obtener icono según categoría
  const getIconoCategoria = (categoria: CATEOGORIAS) => {
    switch (categoria) {
      case "proteina":
        return <Dumbbell className="h-5 w-5" />
      case "creatina":
        return <Zap className="h-5 w-5" />
      case "aminoacidos":
        return <Pill className="h-5 w-5" />
      case "pre-entreno":
        return <Flame className="h-5 w-5" />
      case "quemadores":
        return <Flame className="h-5 w-5" />
      case "vitaminas":
        return <Heart className="h-5 w-5" />
      case "colageno":
        return <Droplets className="h-5 w-5" />
      case "ganador":
        return <Coffee className="h-5 w-5" />
      case "carbohidratos":
        return <Zap className="h-5 w-5" />
      case "barras":
        return <Package className="h-5 w-5" />
      default:
        return <Pill className="h-5 w-5" />
    }
  }

  // Función para obtener la imagen del producto
  const getImagenProducto = (suplemento: any) => {
    if (suplemento.image) {
      return suplemento.image
    }

    // Si no tiene imagen, usar la de la categoría
    if (suplemento.categoria && imagenesPorCategoria[suplemento.categoria]) {
      return imagenesPorCategoria[suplemento.categoria]
    }

    // Imagen por defecto
    return imagenesPorCategoria.otros
  }

  // Función para alternar la expansión de un ítem
  const toggleItemExpansion = (id: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Función para cargar imágenes para el PDF
  const cargarImagenesPDF = async () => {
    const imagenes: { [key: number]: HTMLImageElement } = {}

    // Crear promesas para cargar todas las imágenes
    const promesas = suplementos.map((suplemento) => {
      return new Promise<void>((resolve) => {
        if (!suplemento.id) {
          resolve()
          return
        }

        const img = document.createElement("img")
        img.crossOrigin = "anonymous"

        img.onload = () => {
          if (suplemento.id) {
            imagenes[suplemento.id] = img
          }
          resolve()
        }

        img.onerror = () => {
          // Si falla, intentar con la imagen de categoría
          const imgCategoria = document.createElement("img")
          imgCategoria.crossOrigin = "anonymous"

          imgCategoria.onload = () => {
            if (suplemento.id) {
              imagenes[suplemento.id] = imgCategoria
            }
            resolve()
          }

          imgCategoria.onerror = () => {
            resolve()
          }

          const categoriaImg = imagenesPorCategoria[suplemento.categoria] || imagenesPorCategoria.otros

          imgCategoria.src = categoriaImg
        }

        img.src = getImagenProducto(suplemento)
      })
    })

    // Esperar a que todas las imágenes se carguen
    await Promise.all(promesas)

    // Guardar las imágenes en la referencia
    imagenesRef.current = imagenes
  }

  // Función para dividir los sabores en grupos para el PDF
  const dividirSabores = (sabores: string[]) => {
    if (sabores.length <= 2) return [sabores]

    const resultado = []
    for (let i = 0; i < sabores.length; i += 2) {
      resultado.push(sabores.slice(i, i + 2))
    }
    return resultado
  }

  // Función principal para generar el PDF
  const generarPDF = async () => {
    setGenerandoPDF(true)

    try {
      // Cargar las imágenes
      await cargarImagenesPDF()

      // Crear el documento PDF
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Función para agregar encabezado
      const agregarEncabezado = () => {
        // Color de fondo azul para el encabezado
        doc.setFillColor(25, 55, 125) // Azul oscuro profesional
        doc.rect(0, 0, pageWidth, 25, "F")

        // Línea decorativa
        doc.setDrawColor(255, 255, 255)
        doc.setLineWidth(0.5)
        doc.line(0, 25, pageWidth, 25)

        // Título con mejor tipografía
        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(20)
        doc.text("CATÁLOGO DE SUPLEMENTOS", 15, 15)

        // Información de contacto mejorada
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.text(`Tel: ${contactInfo.phone} | Email: ${contactInfo.email}`, pageWidth - 15, 10, { align: "right" })
        doc.text(`Web: ${url}`, pageWidth - 15, 17, { align: "right" })

        // Fecha de generación
        const fecha = new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        doc.setFontSize(8)
        doc.text(`Generado el: ${fecha}`, pageWidth - 15, 23, { align: "right" })
      }

      // Función para agregar pie de página
      const agregarPieDePagina = (numPagina: number, totalPaginas: number) => {
        // Color de fondo azul claro para el pie de página
        doc.setFillColor(235, 245, 255) // Azul muy claro
        doc.rect(0, pageHeight - 12, pageWidth, 12, "F")

        // Línea decorativa
        doc.setDrawColor(25, 55, 125) // Azul oscuro para la línea
        doc.setLineWidth(0.3)
        doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12)

        // Información del pie de página
        doc.setTextColor(25, 55, 125) // Azul oscuro para el texto
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.text(`Página ${numPagina} de ${totalPaginas}`, 10, pageHeight - 5)
        doc.text(`WhatsApp: ${contactInfo.whatsapp}`, pageWidth / 2, pageHeight - 5, {
          align: "center",
        })
        doc.text(`${url}`, pageWidth - 10, pageHeight - 5, { align: "right" })
      }

      // Configuración de la tabla
      const margenIzquierdo = 10
      const margenSuperior = 30
      const anchoColumnas = [30, 80, 25, 25, 60, 30]
      const altoFila = 25 // Altura de fila

      // Calcular cuántas filas caben por página
      const filasPorPagina = Math.floor((pageHeight - margenSuperior - 15) / altoFila)

      // Calcular número total de páginas
      const totalPaginas = Math.ceil((suplementosFiltrados.length + 1) / filasPorPagina)

      // Agregar primera página
      agregarEncabezado()

      // Encabezados de tabla
      let y = margenSuperior

      // Fondo para encabezados con el nuevo color azul
      doc.setFillColor(25, 55, 125) // Azul oscuro para encabezados
      doc.rect(
        margenIzquierdo,
        y,
        anchoColumnas.reduce((a, b) => a + b, 0),
        altoFila / 1.5,
        "F",
      )

      // Borde inferior para encabezados
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(0.5)
      doc.line(
        margenIzquierdo,
        y + altoFila / 1.5,
        margenIzquierdo + anchoColumnas.reduce((a, b) => a + b, 0),
        y + altoFila / 1.5,
      )

      // Texto de encabezados
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)

      let x = margenIzquierdo
      doc.text("Imagen", x + anchoColumnas[0] / 2, y + altoFila / 3, { align: "center", baseline: "middle" })
      x += anchoColumnas[0]

      doc.text("Producto", x + 4, y + altoFila / 3, { baseline: "middle" })
      x += anchoColumnas[1]

      doc.text("Marca", x + 4, y + altoFila / 3, { baseline: "middle" })
      x += anchoColumnas[2]

      doc.text("Categoría", x + 4, y + altoFila / 3, { baseline: "middle" })
      x += anchoColumnas[3]

      doc.text("Sabores", x + 4, y + altoFila / 3, { baseline: "middle" })
      x += anchoColumnas[4]

      doc.text("Precio", x + 4, y + altoFila / 3, { baseline: "middle" })

      y += altoFila / 1.5

      // Dibujar filas de datos
      let paginaActual = 1

      const suplementosOrdenados = suplementos.sort((a, b) => {
        const categoriaA = a.categoria
        const categoriaB = b.categoria
        const ordenCategoria = ["proteina", "creatina", "aminoacidos", "pre-entreno", "quemadores", "vitaminas", "colageno", "ganador", "carbohidratos", "barras","energia"]
        return ordenCategoria.indexOf(categoriaA) - ordenCategoria.indexOf(categoriaB)
      })

      for (let i = 0; i < suplementosOrdenados.length; i++) {
        const suplemento = suplementosOrdenados[i]
        const saboresGrupos = dividirSabores(suplemento.flavors)
        const altoFilaActual = altoFila // Altura fija para todas las filas

        // Verificar si necesitamos una nueva página
        if (i > 0 && y + altoFilaActual > pageHeight - 15) {
          // Agregar pie de página
          agregarPieDePagina(paginaActual, totalPaginas)

          // Agregar nueva página
          doc.addPage()
          paginaActual++

          // Agregar encabezado en la nueva página
          agregarEncabezado()

          // Reiniciar posición Y
          y = margenSuperior

          // Encabezados de tabla en la nueva página
          doc.setFillColor(25, 55, 125) // Azul oscuro para encabezados
          doc.rect(
            margenIzquierdo,
            y,
            anchoColumnas.reduce((a, b) => a + b, 0),
            altoFila / 1.5,
            "F",
          )

          // Borde inferior para encabezados
          doc.setDrawColor(255, 255, 255)
          doc.setLineWidth(0.5)
          doc.line(
            margenIzquierdo,
            y + altoFila / 1.5,
            margenIzquierdo + anchoColumnas.reduce((a, b) => a + b, 0),
            y + altoFila / 1.5,
          )

          // Texto de encabezados
          doc.setTextColor(255, 255, 255)
          doc.setFont("helvetica", "bold")
          doc.setFontSize(11)

          x = margenIzquierdo
          doc.text("Imagen", x + anchoColumnas[0] / 2, y + altoFila / 3, { align: "center", baseline: "middle" })
          x += anchoColumnas[0]

          doc.text("Producto", x + 4, y + altoFila / 3, { baseline: "middle" })
          x += anchoColumnas[1]

          doc.text("Marca", x + 4, y + altoFila / 3, { baseline: "middle" })
          x += anchoColumnas[2]

          doc.text("Categoría", x + 4, y + altoFila / 3, { baseline: "middle" })
          x += anchoColumnas[3]

          doc.text("Sabores", x + 4, y + altoFila / 3, { baseline: "middle" })
          x += anchoColumnas[4]

          doc.text("Precio", x + 4, y + altoFila / 3, { baseline: "middle" })

          y += altoFila / 1.5
        }

        // Alternar colores de fondo para las filas con tonos de azul
        if (i % 2 === 0) {
          doc.setFillColor(240, 248, 255) // Azul muy claro
        } else {
          doc.setFillColor(255, 255, 255) // Blanco
        }
        doc.rect(
          margenIzquierdo,
          y,
          anchoColumnas.reduce((a, b) => a + b, 0),
          altoFilaActual,
          "F",
        )

        // Agregar líneas divisorias sutiles entre columnas
        doc.setDrawColor(200, 220, 240) // Azul claro para líneas
        doc.setLineWidth(0.1)

        let lineX = margenIzquierdo
        for (let j = 0; j < anchoColumnas.length - 1; j++) {
          lineX += anchoColumnas[j]
          doc.line(lineX, y, lineX, y + altoFilaActual)
        }

        // Línea horizontal inferior
        doc.line(
          margenIzquierdo,
          y + altoFilaActual,
          margenIzquierdo + anchoColumnas.reduce((a, b) => a + b, 0),
          y + altoFilaActual,
        )

        // Agregar imagen
        if (suplemento.id && imagenesRef.current[suplemento.id]) {
          try {
            const img = imagenesRef.current[suplemento.id]
            if (img) {
              // Calcular dimensiones para mantener proporción
              const imgWidth = 26
              const imgHeight = 26

              // Centrar la imagen en la celda
              const imgX = margenIzquierdo + (anchoColumnas[0] - imgWidth) / 2
              const imgY = y + (altoFilaActual - imgHeight) / 2

              // Agregar un fondo blanco para la imagen
              doc.setFillColor(255, 255, 255)
              doc.circle(imgX + imgWidth / 2, imgY + imgHeight / 2, imgWidth / 2 + 1, "F")

              // Agregar un borde sutil
              doc.setDrawColor(200, 220, 240) // Azul claro para el borde
              doc.setLineWidth(0.2)
              doc.circle(imgX + imgWidth / 2, imgY + imgHeight / 2, imgWidth / 2 + 1, "S")

              // Agregar la imagen
              doc.addImage(img, "JPEG", imgX, imgY, imgWidth, imgHeight)
            }
          } catch (error) {
            console.error("Error al agregar imagen al PDF:", error)
          }
        }

        // Agregar datos de texto
        doc.setTextColor(50, 50, 50) // Gris oscuro para texto general
        doc.setFontSize(9)

        x = margenIzquierdo + anchoColumnas[0]

        // Producto (con descripción)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(25, 55, 125) // Azul oscuro para el nombre del producto
        doc.text(suplemento.product, x + 4, y + 6)

        doc.setFont("helvetica", "normal")
        doc.setTextColor(80, 80, 80) // Gris para la descripción
        doc.setFontSize(7)
        if (suplemento.descripcion) {
          const descripcionCorta =
            suplemento.descripcion.substring(0, 80) + (suplemento.descripcion.length > 80 ? "..." : "")
          doc.text(descripcionCorta, x + 4, y + 12, { maxWidth: anchoColumnas[1] - 8 })
        }

        x += anchoColumnas[1]

        // Marca
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.setTextColor(50, 50, 50) // Gris oscuro
        doc.text(suplemento.brand, x + 4, y + altoFilaActual / 2, { baseline: "middle" })
        doc.setFont("helvetica", "normal")

        x += anchoColumnas[2]

        // Categoría
        const categoriaTexto = suplemento.categoria.charAt(0).toUpperCase() + suplemento.categoria.slice(1)
        doc.text(categoriaTexto, x + 4, y + altoFilaActual / 2, { baseline: "middle" })

        x += anchoColumnas[3]

        // Sabores - Mostrar en una línea con separación por comas
        if (suplemento.flavors.length > 0) {
          const saboresTexto = suplemento.flavors.join(", ")
          doc.setFontSize(7)
          doc.text(saboresTexto, x + 4, y + altoFilaActual / 2, {
            baseline: "middle",
            maxWidth: anchoColumnas[4] - 8,
          })
          doc.setFontSize(8)
        } else {
          doc.text("-", x + 4, y + altoFilaActual / 2, { baseline: "middle" })
        }

        x += anchoColumnas[4]

        // Precio con fondo destacado
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(25, 55, 125) // Azul oscuro para el precio

        // Agregar un fondo claro para destacar el precio
        const precioText = formatearPrecio(suplemento.price)
        const precioWidth = doc.getTextWidth(precioText)
        doc.setFillColor(230, 240, 255) // Azul muy claro para el fondo del precio
        doc.roundedRect(x + 2, y + altoFilaActual / 2 - 6, precioWidth + 4, 12, 2, 2, "F")
        doc.text(precioText, x + 4, y + altoFilaActual / 2, { baseline: "middle" })

        // Restaurar estilos
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(50, 50, 50)

        // Avanzar a la siguiente fila
        y += altoFilaActual
      }

      // Agregar pie de página en la última página
      agregarPieDePagina(paginaActual, totalPaginas)

      // Guardar PDF
      doc.save("catalogo-suplementos.pdf")
    } catch (error) {
      console.error("Error al generar PDF:", error)
    } finally {
      setGenerandoPDF(false)
    }
  }

  // Componente de filtros para móvil (compacto)
  const MobileFiltersComponent = () => (
    <div className="w-full space-y-4 bg-white dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
      {/* Marcas en formato compacto */}
      <div className="w-full">
        <h3 className="text-sm font-medium mb-2 text-green-800 dark:text-green-400">Marca</h3>
        <div className="flex flex-wrap gap-1.5">
          {marcas.map((marca) => (
            <Badge
              key={marca.value}
              variant={marcaSeleccionada === marca.value ? "default" : "outline"}
              className={`cursor-pointer py-1 px-2 ${
                marcaSeleccionada === marca.value
                  ? "bg-green-600 hover:bg-green-700"
                  : "border-green-300 hover:bg-green-100"
              }`}
              onClick={() => handleMarcaChange(marca.value)}
            >
              {marca.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Categoría y Ordenar en formato compacto */}
      <div className="flex gap-2">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2 text-green-800 dark:text-green-400">Categoría</h3>
          <Select value={categoriaSeleccionada} onValueChange={(value: any) => setCategoriaSeleccionada(value)}>
            <SelectTrigger className="border-green-200 py-1 text-sm h-9">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((categoria) => (
                <SelectItem key={categoria} value={categoria} className="text-sm py-1.5">
                  {categoria === "todos"
                    ? "Todas las categorías"
                    : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2 text-green-800 dark:text-green-400">Ordenar</h3>
          <Select value={ordenPrecio} onValueChange={setOrdenPrecio}>
            <SelectTrigger className="border-green-200 py-1 text-sm h-9">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ninguno" className="text-sm py-1.5">
                Sin ordenar
              </SelectItem>
              <SelectItem value="ascendente" className="text-sm py-1.5">
                Menor a mayor
              </SelectItem>
              <SelectItem value="descendente" className="text-sm py-1.5">
                Mayor a menor
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  // Componente de filtros para desktop
  const DesktopFiltersComponent = () => (
    <div className="flex flex-col gap-8 w-full">
      {/* Marcas */}
      <div className="w-full">
        <h3 className="text-lg font-medium mb-4 text-green-800 dark:text-green-400">Marca</h3>
        <Tabs value={marcaSeleccionada} onValueChange={handleMarcaChange} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto bg-white dark:bg-green-950 p-2 gap-2 rounded-lg">
            {marcas.map((marca) => (
              <TabsTrigger
                key={marca.value}
                value={marca.value}
                className="py-3 flex flex-col items-center bg-green-100/40 border-green-300/25 gap-2 data-[state=active]:bg-green-200 dark:data-[state=active]:bg-green-800"
              >
                <div className="w-full h-12 relative">
                  <Image src={marca.image || "/placeholder.svg"} alt={marca.name} fill className="object-contain" />
                </div>
                <span className="font-medium">{marca.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Categoría y Ordenar en formato flex-col para desktop */}
      <div className="flex flex-col gap-6">
        <div className="w-full">
          <h3 className="text-lg font-medium mb-4 text-green-800 dark:text-green-400">Categoría</h3>
          <Select value={categoriaSeleccionada} onValueChange={(value: any) => setCategoriaSeleccionada(value)}>
            <SelectTrigger className="border-green-200 py-6 text-lg">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((categoria) => (
                <SelectItem key={categoria} value={categoria} className="text-lg py-3">
                  {categoria === "todos"
                    ? "Todas las categorías"
                    : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ordenar por precio */}
        <div className="w-full">
          <h3 className="text-lg font-medium mb-4 text-green-800 dark:text-green-400">Ordenar por precio</h3>
          <Select value={ordenPrecio} onValueChange={setOrdenPrecio}>
            <SelectTrigger className="border-green-200 py-6 text-lg">
              <SelectValue placeholder="Ordenar por precio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ninguno" className="text-lg py-3">
                Sin ordenar
              </SelectItem>
              <SelectItem value="ascendente" className="text-lg py-3">
                Menor a mayor
              </SelectItem>
              <SelectItem value="descendente" className="text-lg py-3">
                Mayor a menor
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
      <style jsx global>
        {tableStyles}
      </style>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          {/* Cabecera */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-4xl font-bold text-green-800 dark:text-green-400">Catálogo de Suplementos</h1>
            <p className="text-muted-foreground">Explora nuestra selección de suplementos deportivos de alta calidad</p>

            {/* Información de contacto */}
            <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm text-green-700 dark:text-green-300">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{contactInfo.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                <Link href={url} target="_blank">
                  {url}
                </Link>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col gap-4">
            {/* Barra de búsqueda y botón de exportar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o sabor..."
                  className="pl-10 py-6 text-lg border-green-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generarPDF}
                  className="flex gap-2 bg-green-600 hover:bg-green-700 py-6 px-5 text-lg rounded-lg"
                  disabled={generandoPDF}
                >
                  {generandoPDF ? (
                    <>Generando...</>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Descargar PDF
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Filtros visibles en mobile */}
            {isMobile && <MobileFiltersComponent />}

            {/* Filtros visibles en desktop */}
            {!isMobile && (
              <div className="flex flex-wrap gap-6 p-6 bg-white dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 shadow-md">
                <DesktopFiltersComponent />
              </div>
            )}
          </div>

          {/* Filtros activos */}
          <div className="flex flex-wrap gap-2">
            {marcaSeleccionada !== "todos" && (
              <Badge variant="secondary" className="flex gap-1 bg-green-200 text-green-800 py-2 px-4 text-base">
                Marca: {marcaSeleccionada}
              </Badge>
            )}
            {categoriaSeleccionada !== "todos" && (
              <Badge variant="secondary" className="flex gap-1 bg-green-200 text-green-800 py-2 px-4 text-base">
                Categoría: {categoriaSeleccionada.charAt(0).toUpperCase() + categoriaSeleccionada.slice(1)}
              </Badge>
            )}
            {busqueda && (
              <Badge variant="secondary" className="flex gap-1 bg-green-200 text-green-800 py-2 px-4 text-base">
                Búsqueda: {busqueda}
              </Badge>
            )}
            {ordenPrecio !== "ninguno" && (
              <Badge variant="secondary" className="flex gap-1 bg-green-200 text-green-800 py-2 px-4 text-base">
                Precio: {ordenPrecio === "ascendente" ? "Menor a mayor" : "Mayor a menor"}
              </Badge>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="text-lg text-muted-foreground">{suplementosFiltrados.length} productos encontrados</div>

          {/* Vista móvil: Tabla expandible */}
          <div className="xl:hidden">
            <Card className="border-green-200 overflow-hidden shadow-md">
              <div className="divide-y divide-green-100 dark:divide-green-800">
                {suplementosFiltrados.map((suplemento) => (
                  <div key={suplemento.id} className="bg-white dark:bg-green-950">
                    {/* Fila principal siempre visible */}
                    <div
                      className="flex items-center p-4 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900"
                      onClick={() => suplemento.id && toggleItemExpansion(suplemento.id)}
                    >
                      <div className="w-16 h-16 mr-4 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={getImagenProducto(suplemento) || "/placeholder.svg"}
                          alt={suplemento.product}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-green-800 dark:text-green-400 text-base truncate">
                          {suplemento.product}
                        </h3>
                        <p className="text-sm text-muted-foreground">{suplemento.brand}</p>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        <span className="font-bold text-green-700 dark:text-green-300 text-base">
                          {formatearPrecio(suplemento.price)}
                        </span>
                        {suplemento.id && expandedItems[suplemento.id] ? (
                          <ChevronUp className="h-5 w-5 text-green-600 mt-1" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-green-600 mt-1" />
                        )}
                      </div>
                    </div>

                    {/* Contenido expandible */}
                    {suplemento.id && expandedItems[suplemento.id] && (
                      <div className="p-4 pt-0 pl-24 bg-green-50 dark:bg-green-900/50">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Categoría:</span>{" "}
                            <Badge
                              variant="outline"
                              className="ml-1 border-green-300 text-green-700 dark:text-green-400"
                            >
                              <span className="flex items-center gap-1">
                                {getIconoCategoria(suplemento.categoria)}
                                {suplemento.categoria.charAt(0).toUpperCase() + suplemento.categoria.slice(1)}
                              </span>
                            </Badge>
                          </div>

                          {suplemento.descripcion && (
                            <div>
                              <span className="font-medium">Descripción:</span>
                              <p className="text-muted-foreground mt-1">{suplemento.descripcion}</p>
                            </div>
                          )}

                          {suplemento.flavors.length > 0 && (
                            <div>
                              <span className="font-medium">Sabores:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {suplemento.flavors.map((sabor) => (
                                  <Badge
                                    key={sabor}
                                    variant="secondary"
                                    className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                                  >
                                    {sabor}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-green-200 dark:border-green-800 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1 mb-1">
                              <Phone className="h-3 w-3" />
                              <span>{contactInfo.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Vista desktop: Tabla */}
          <div className="hidden xl:block">
            <Card className="border-green-200 overflow-hidden shadow-md">
              <Table className="table-fixed">
                <TableHeader className="bg-green-100 dark:bg-green-800">
                  <TableRow>
                    <TableHead className="w-24 py-4 text-base">Imagen</TableHead>
                    <TableHead className="w-[35%] py-4 text-base">Producto</TableHead>
                    <TableHead className="w-[10%] py-4 text-base">Marca</TableHead>
                    <TableHead className="w-[10%] py-4 text-base">Categoría</TableHead>
                    <TableHead className="w-[25%] py-4 text-base">Sabores</TableHead>
                    <TableHead className="w-[12%] text-right py-4 text-base">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suplementosFiltrados.map((suplemento) => (
                    <TableRow key={suplemento.id} className="hover:bg-green-50 dark:hover:bg-green-900">
                      <TableCell className="py-4 w-24">
                        <div className="h-24 w-24 rounded-md overflow-hidden">
                          <Image
                            src={getImagenProducto(suplemento) || "/placeholder.svg"}
                            alt={suplemento.product}
                            width={100}
                            height={100}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium py-4 w-[35%]">
                        <div>
                          <div className="font-semibold text-green-800 dark:text-green-400 text-lg">
                            {suplemento.product}
                          </div>
                          {suplemento.descripcion && (
                            <div className="text-sm text-muted-foreground line-clamp-2">{suplemento.descripcion}</div>
                          )}
                          <div className="text-sm text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contactInfo.phone}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 w-[10%]">
                        <Badge
                          variant="outline"
                          className="border-green-300 text-green-700 dark:text-green-400 py-1.5 px-3 text-base"
                        >
                          {suplemento.brand}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 w-[10%]">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 border-green-300 text-green-700 dark:text-green-400 py-1.5 px-3 text-base"
                        >
                          {getIconoCategoria(suplemento.categoria)}
                          {suplemento.categoria.charAt(0).toUpperCase() + suplemento.categoria.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 w-[25%]">
                        {suplemento.flavors.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {suplemento.flavors.map((sabor) => (
                              <Badge
                                key={sabor}
                                variant="secondary"
                                className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 py-1 px-2 text-sm"
                              >
                                {sabor}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-700 dark:text-green-300 text-xl py-4 w-[12%] whitespace-nowrap">
                        {formatearPrecio(suplemento.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Pie de página con información de contacto */}
          <div className="mt-8 pt-6 border-t border-green-200 dark:border-green-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-3 text-lg">Contacto</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    <span>{contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-green-600" />
                    <span>{contactInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-green-600" />
                    <Link href={url} target="_blank">
                      {url}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
