# basicad

## Cara menjalankan program

Requirements: Node Package Manager (NPM)

### Langkah-langkah

1. Install `typescript-bundle` dan `serve`

   ```sh
   npm i -g typescript-bundle serve
   ```

2. Run

   ```sh
   tsc-bundle tsconfig.json
   ```

3. Serve

   ```sh
   serve src
   ```

Akan muncul pesan yang berisi alamat IP (localhost) dan port yang dapat diakses untuk menjalankan program.

## Tipe, Kelas, Fungsi, dan Metode Non-Primitif

### Kelas `Vector2`
`Vector2` merupakan kelas yang memuat 2 nilai float.

#### Static Property
- `zero: Vector2` - membuat vektor (0, 0) baru

#### Property
- `x: number` - nilai float pertama
- `y: number` - nilai float kedua
- `data: number[]` - representasi objek `Vector2` ini dalam _flat array_
- `magnitude: number` - besar/panjang objek `Vector2` ini

#### Static Method
- `multiplyEach(a: Vector2, b: Vector2): Vector2` - mengalikan setiap komponen vektor `a` dengan komponen yang bersesuaian pada vektor `b`
- `squaredDistance(a: Vector2, b: Vector2): number` - menghitung jarak kuadrat titik `a` dengan titik `b`
- `distance(a: Vector2, b: Vector2): number` - menghitung jarak titik `a` dengan titik `b`

#### Method
- `set(other: Vector2)` - meng-_assign_ nilai `other` ke vektor ini tanpa melakukan _update_
- `clone(): Vector2` - meng-_clone_ vektor ini
- `add(other: Vector2): Vector2` - menjumlahkan vektor ini dengan vektor lain `other`
- `sub(other: Vector2): Vector2` - mengurangi vektor lain `other` dari vektor ini
- `arc(): number` - menghitung besar sudut tangent antara vektor ini dengan sumbu-x
- `rotate(angle: number, origin: Vector2)` - merotasi vektor ini sebesar `angle` derajat dengan titik pusat `origin`
- `scale(factor: number)` - memperbesar vektor ini sebesar `factor` kali
- `scaleX(factor: number)` - memperbesar komponen x vektor ini sebesar `factor` kali
- `scaleY(factor: number)` - memperbesar komponen y vektor ini sebesar `factor` kali

### Kelas `Vector3`
`Vector3` merupakan kelas yang memuat 3 nilai float.

#### Static Property
- `zero: Vector3` - membuat vektor (0, 0, 0) baru

#### Property
- `x: number` - nilai float pertama
- `y: number` - nilai float kedua
- `z: number` - nilai float ketiga
- `data: number[]` - representasi objek `Vector3` ini dalam _flat array_

#### Method
- `clone(): Vector3` - meng-_clone_ vektor ini

### Kelas `Transform`
`Transform` merupakan kelas yang merepresentasikan transformasi suatu objek.

#### Static Property
- `origin: Vector3` - membuat `Transform` baru dengan position (0, 0), rotation 0, dan scale 1.

#### Property
- `position: Vector2` - posisi atau translasi dari objek
- `rotation: number` - sudut rotasi objek pada arah counter-clockwise
- `scale: number` - besar skala objek

#### Setter
- `set x(value: number)` - mengubah nilai `position.x` dari `Transform` ini
- `set y(value: number)` - mengubah nilai `position.y` dari `Transform` ini

### Kelas `Vertex`
`Vertex` merupakan kelas yang merepresentasikan vertex suatu objek/model.

#### Static Method
- `origin()` - membuat vertex baru dengan posisi (0, 0) dan warna hitam

#### Property
- `parentTransform: Transform` - `Transform` dari objek yang memuat vertex ini
- `color: Vector3` - warna vertex ini
- `globalCoord: Vector2` - posisi global vertex ini saat ditampilkan
- `data: number[]` - representasi vertex ini dalam _flat array_

#### Method
- `distanceTo(line: [Vertex, Vertex]): number` - menghitung jarak vertex ini terhadap garis `line` yang dibentuk oleh 2 vertex
- `bind(parent: Shape)` - mengikat vertex ini pada objek `parent`
- `rotate(angle: number)` - merotasi posisi vertex ini sebesar `angle` derajat dengan mempertimbangkan `Transform` objek yang terikat
- `scale(factor: number)` - memperbesar jarak vertex ini terhadap posisi objek yang terikat sebesar `factor` kali
- `scaleX(factor: number)` - memperbesar jarak vertex ini terhadap posisi objek yang terikat sebesar `factor` kali pada sumbu-x
- `scaleY(factor: number)` - memperbesar jarak vertex ini terhadap posisi objek yang terikat sebesar `factor` kali pada sumbu-y

### Kelas `Shape`
`Shape` merepresentasikan objek/model yang dapat ditampilkan.

#### Property
- `data: number[]` - representasi objek `Shape` ini dalam _flat array_
- `isHighlighted: boolean` - nilai boolean yang menyatakan apakah objek ini menjadi sorotan
- `isHidden: boolean` - nilai boolean yang menyatakan apakah objek ini disembunyikan dari tampilan
- `vertices: Vertex[]` - daftar vertex yang menyusun objek ini
- `vertexCount: number` - banyak vertex yang menyusun objek ini
- `center: Vector2` - posisi titik tengah **lokal** dari seluruh vertex penyusun objek ini

#### Method
- `update()` - memaksa _update_ objek ini pada frame animasi selanjutnya
- `setVerticesColor(color: Vector3)` - mengubah seluruh warna vertex penyusun objek ini
- `rotate(angle: number)` - merotasi objek ini sebesar `angle` derajat
- `translate(distance: Vector2)` - memindahkan objek ini berdasarkan vektor `distance`
- `translateX(distance: number)` - memindahkan objek ini sejauh `distance` pada sumbu-x
- `translateY(distance: number)` - memindahkan objek ini sejauh `distance` pada sumbu-y
- `scale(factor: number)` - memperbesar objek ini sebesar `factor` kali

#### Abstract Method
- `drawMode(context: WebGLRenderingContext): number` - mengembalikan mode penggambaran objek ini

### Kelas `Line`
`Line` merepresentasikan objek garis.

#### Property
- `length: number` - panjang garis ini

#### Method
- `initVertices()` - menginisialisasi vertex-vertex penyusun garis ini
- `onVertexChanged(_: Vertex)` - memperbarui panjang garis ketika vertex penyusunnya digerakkan
- `drawMode(context: WebGLRenderingContext): number` - mengembalikan mode penggambaran garis ini (`LINE_STRIP`)

### Kelas `Square`
`Square` merepresentasikan objek persegi.

#### Property
- `size: number` - ukuran (panjang sisi) persegi ini

#### Method
- `initVertices()` - menginisialisasi vertex-vertex penyusun persegi ini
- `onVertexChanged(vertex: Vertex)` - memperbarui ukuran dan vertex lain ketika salah satu `vertex` penyusunnya digerakkan
- `drawMode(context: WebGLRenderingContext): number` - mengembalikan mode penggambaran garis ini (`TRIANGLE_FAN`)

### Tipe Quadrant
`type Quadrant = 0 | 1 | 2 | 3`
`Quadrant` merupakan tipe yang menyatakan indeks suatu kuadran.

### Kelas `Rectangle`
`Rectangle` merepresentasikan objek persegi panjang.

#### Property
- `length: number` - panjang persegi panjang ini
- `width: number` - lebar persegi panjang ini

#### Static Method
- `getMultiplier(index: Quadrant): number` - mengembalikan pengali posisi vertex pada kuadran `index` terhadap vertex kanan atas

#### Method
- `initVertices()` - menginisialisasi vertex-vertex penyusun persegi panjang ini
- `onVertexChanged(vertex: Vertex)` - memperbarui panjang, lebar, dan vertex lain ketika salah satu `vertex` penyusunnya digerakkan
- `drawMode(context: WebGLRenderingContext): number` - mengembalikan mode penggambaran garis ini (`TRIANGLE_FAN`)

### Kelas `Polygon`
`Polygon` merepresentasikan objek poligon.

#### Property
- `data: number[]` - representasi objek `Polygon` ini sebagai deretan data vertex penyusun segitiga hasil triangulasi dalam bentuk _flat array_

#### Static Method
- `regular(vertices: number, radius: number): Polygon` - membuat `Polygon` teratur dengan `vertices` vertex yang berjarak `radius` terhadap titik tengahnya
- `isInTriangle(point: Vector2, vertex1: Vector2, vertex2: Vector2, vertex3: Vector2)` - mengecek apakah `point` berada di dalam segitiga yang disusun oleh titik-titik dengan posisi `vertex1`, `vertex2`, dan `vertex3`
- `doubleTriangleArea(a: Vector2, b: Vector2, c: Vector2)` - menghitung dua kali luas segitiga yang disusun oleh titik-titik `a`, `b`, dan `c`
- `convexHull(vertices: Vertex[], baseLine?: [Vertex, Vertex], direction?: "upwards" | "downwards"): Vertex[]` - menghitung convex hull dari vertex-vertex `vertices`
- `getFarthestVertex(vertices: Vertex[], line: [Vertex, Vertex]): Vertex` - mencari vertex pada `vertices` yang memiliki jarak terjauh dengan `line`
- `getUpperVertices(vertices: Vertex[], line: [Vertex, Vertex]): Vertex[]` - mencari semua vertex pada `vertices` yang berada di atas `line`
- `getLowerVertices(vertices: Vertex[], line: [Vertex, Vertex]): Vertex[]` - mencari semua vertex pada `vertices` yang berada di bawah `line`
- `isVerticalLine(line: [Vertex, Vertex]): boolean` - mengecek apakah garis `line` merupakan garis vertikal
- `findEar(vertices: Vertex[], convexVertices: Vertex[]): number` - mencari vertex pada `vertices` yang merupakan vertex tengah _ear_ berdasarkan informasi vertex convex `convexVertices` berdasarkan algoritma _ear clipping_

#### Method
- `addVertex(vertex: Vertex)` - menambah vertex baru ke dalam poligon ini sebagai vertex terakhir
- `deleteVertex(vertex: Vertex | number)` - menghapus vertex dari poligon ini berdasarkan urutan vertex atau instance `Vertex` tersebut
- `triangulate(): Vertex[]` - memecah poligon ini ke dalam segitiga-segitga untuk di-render dengan benar
- `drawMode(context: WebGLRenderingContext): number` - mengembalikan mode penggambaran garis ini (`TRIANGLES`)

### Kelas Abstrak `Color`
`Color` memuat representasi warna-warna yang telah didefinisikan dan metode untuk menyusun warna.

#### Static Property
- `black: Vector3` - merepresentasikan warna hitam
- `red: Vector3` - merepresentasikan warna merah
- `green: Vector3` - merepresentasikan warna hijau
- `blue: Vector3` - merepresentasikan warna biru
- `white: Vector3` - merepresentasikan warna putih

#### Static Method
- `rgb(r: number, g: number: b: number): Vector3` - merepresentasikan warna dalam _color space_ RGB dengan batasan nilai 0-255