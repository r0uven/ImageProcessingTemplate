#В текущей папке должны лежать картинки
# checkerboard_18x18.png
# checkerboard_fuzzy_18x18.jpg
# coca-cola-logo.png
# New_Zealand_Lake.jpg
# tr.jpg


# из библиотеки google.colab импортируем класс files
from google.colab import files
# создаем объект этого класса, применяем метод .upload()
#Нам будет предложено выбрать файл на жестком диске.
uploaded = files.upload()

import cv2  # собственно OpenCV
import numpy as np  # для работы с математикой
import matplotlib.pyplot as plt #пакет pyplot, который используется для построения графика заданных данных

# # из библиотеки google.colab импортируем класс files
# from google.colab import files
# # создаем объект этого класса, применяем метод .upload()
# #Нам будет предложено выбрать файл на жестком диске.
# uploaded = files.upload()


# # Читаем изображение как чёрно-белое
cb_img = cv2.imread("checkerboard_18x18.png",0)


# # Печатаем что прочитали. Каждый пиксель есть элемент двумерного массива numpy.
# # Значени епикселей восьмибитное: [0,255]
print(cb_img)

# вывод размера изображения (то есть, массива Numpy)
print("Image size is ", cb_img.shape)

# тип данных в изображении (то есть, в массиве Numpy)
print("Data type of image is ", cb_img.dtype)

# рисуем шашечки
plt.imshow(cb_img)

# Поставим настройку color map
plt.imshow(cb_img, cmap='gray')
# выводим шашечки
plt.show()


# Читаем картинку как чб
cb_img_fuzzy = cv2.imread("checkerboard_fuzzy_18x18.jpg",0)

# Печатаем массив
print(cb_img_fuzzy)

# Показываем картинку
plt.imshow(cb_img_fuzzy,cmap='gray')
plt.show()



coke_img = cv2.imread("coca-cola-logo.png",1)

print("Image size is ", coke_img.shape)

print("Data type of image is ", coke_img.dtype)
plt.imshow(coke_img)
plt.show()
#          ниже numpy-специфичная конструкция:
#    (:) — взять каждый элемент по порядку,
# (::-1) — взять каждый элемент, но в обратном порядке.
coke_img_channels_reversed = coke_img[:, :, ::-1]

plt.imshow(coke_img_channels_reversed)


coke_img = cv2.imread("coca-cola-logo.png",1)

print("Image size is ", coke_img.shape)

print("Data type of image is ", coke_img.dtype)
plt.imshow(coke_img)
plt.show()
#Так короче преобразовать цвета в RGB
img=cv2.cvtColor(coke_img,cv2.COLOR_BGR2RGB)
plt.imshow(img)
plt.show()

# Читаем и разбиваем картинку на каналы: B,G,R
#cv2.IMREAD_COLOR - это константа = 1 (загружает картинку как цветную, без альфа-канала.)
img_NZ_bgr = cv2.imread("New_Zealand_Lake.jpg",cv2.IMREAD_COLOR)
b,g,r = cv2.split(img_NZ_bgr)

# Отрисовываем их
plt.figure(figsize=[20,5])
plt.subplot(141);plt.imshow(r,cmap='gray');plt.title("Red Channel")
plt.subplot(142);plt.imshow(g,cmap='gray');plt.title("Green Channel")
plt.subplot(143);plt.imshow(b,cmap='gray');plt.title("Blue Channel")

# Читаем и разбиваем картинку на каналы: B,G,R
#cv2.IMREAD_COLOR - это константа = 1 (загружает картинку как цветную, без альфа-канала.)
tr = cv2.imread("tr1.jpg",cv2.IMREAD_COLOR)
plt.imshow(tr)
plt.show()
#преобразуем цвета BGR -> RGB
tr1 = cv2.cvtColor(tr, cv2.COLOR_BGR2RGB)
plt.imshow(tr1)
plt.show()


r, g, b = cv2.split(tr1)

# Отрисовываем их
plt.figure(figsize=[20,5])
plt.subplot(141);plt.imshow(r,cmap='gray');plt.title("Red Channel")
plt.subplot(142);plt.imshow(g,cmap='gray');plt.title("Green Channel")
plt.subplot(143);plt.imshow(b,cmap='gray');plt.title("Blue Channel")

from mpl_toolkits.mplot3d import Axes3D
r = r.flatten()
g = g.flatten()
b = b.flatten()


fig = plt.figure() #создаем новую фигуру

ax = Axes3D(fig)
#Создаём точечную диаграмму.
ax.scatter(r, g, b)
plt.show()









