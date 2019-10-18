ServerStatus-DogSon
===================

云探针，多服务器探针，云监控，多服务器云监控

根据ServerStatus-Hotaru的前端Web UI，基于Node.JS重写而来的。

目前是0.0.1测试版，多服务器探针服务已经完成，下个版本更新admin面板，支持在线添加服务器。

使用方法
====

服务器端
----

修改conf/conf.js下的服务器信息

![](README.files/image002.jpg)

在data.json中添加服务器信息

![](README.files/image004.jpg)

在服务器启动main.js

客户端
---

修改client/conf/conf.js

![](README.files/image006.jpg)

演示
==

![](README.files/image008.jpg)

![](README.files/image010.jpg)

相关开源项目
======

ServerStatus-Toyo：[https://github.com/CokeMine/ServerStatus-Hotaru](https://github.com/CokeMine/ServerStatus-Hotaru)

ServerStatus-Toyo：https : //github.com/ToyoDAdoubiBackup/ServerStatus-Toyo

ServerStatus：https : //github.com/BotoX/ServerStatus

mojeda：https：//github.com/mojeda

mojeda的ServerStatus：https : //github.com/mojeda/ServerStatus

BlueVM的项目：http : //www.lowendtalk.com/discussion/comment/169690#Comment_169690## 目标

去除 iconfinder 上 icon 的水印

### 原理

利用水印像素点和原图像素点颜色合并的原理，如果拥有加过水印的图片和水印图片，就可以反向推出原图原像素点的颜色；前提是你得拥有他的水印图片
