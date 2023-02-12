# basicad

## Cara menjalankan program

Requirements:

1. Node.js

### Langkah-langkah

1. Install `typescript-bundle`

   ```sh
   npm i -g typescript-bundle
   ```

2. Run

   ```sh
   tsc-bundle tsconfig.json
   ```

3. Serve

   ```sh
   serve src
   ```

## Kelas, Fungsi, dan Metode Non-Primitif

### `Vector2`
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

### `Vector3`
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

### `Transform`
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
