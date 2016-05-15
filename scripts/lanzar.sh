#Lanza un determinado proceso java en una mAquina remota host, con los par?metros param1, param2 (extensible a mAs par?metros o mAquinas)
#usage lanzar [user@]host param1 param2
#p.ej. lanzar 172.3.4.100 0 128.34.5.0

if [ $# -eq 3 ]
then
  host=$1
  param1=$2
  param2=$3

  echo "Lanzando proceso en mAquina $host"
  #1) limpiamos cOdigo anterior, almacenado en la ruta 'carpetaRemota'
  ssh $host "rm carpetaRemota/*; rmdir carpetaRemota; mkdir carpetaRemota; exit"

  #2) mandamos cOdigo nuevo a esa misma ruta
  scp carpetaLocal/* $host:carpetaRemota

  #3) En el caso de usar javaRMI, podemos arrancar rmiregistry
  #o lo arrancamos donde estAn todos los binarios o seteamos codebase
  ssh $host "cd carpetaRemota; rmiregistry &; exit" &

  #4) compilamos
  #Podemos haber compilado en local y haber mandado los .class en el paso 2, y saltarnos este paso
  #O bien compilar en remoto con este paso

  #NOTA: puede ser que nos diga "java: orden no encontrada" a ejecutar esto,
  # Se debe a que en modo no interactivo (es decir, cuando ejecutamos una orden
  # sin mAs), no toma .bashrc, sOlo lo que haya en /etc/profile, asI que tendremos
  # que copiar allI las vbles de entorno que necesitemos, o pasar toda la ruta de
  # java como parAmetro

  #ssh $host "javac paquete/Clase.java"     si pilla bien java
  #ssh $host "$javaPath/javac paquete/Clase.java" pas?ndole la ruta entera

  #5) ejecutamos
  echo "lanzamos java paquete.Clase $param1 $param2"
  ssh $host "java paquete.Clase $param1 $param2"

  #O si necesitamos a?adir elementos librer?as adicionales
  ssh $host "java -cp.:pathLib/* paquete.Clase $param1 $param2"





else
  echo "Uso: $0 [user@]host id numProc host1 host2"
  exit
fi
