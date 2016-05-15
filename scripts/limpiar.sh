#limpia cualquier carpeta con nombre $2 en la mAquina@usuario $1
if [ $# -eq 2 ]
then
  host=$1
  path=$2

  echo "Lanzando Limpiar $ip $path en máquina $maq"
  echo "ssh $host \"rm $path/*; rmdir $path; mkdir $path\""
   ssh $host "rm $path/*; rmdir $path; mkdir $path; rmiregistry &"
  # scp -l p1777026 $ip /Users/rodri/Documents/workspace/assoo/bin multidifusion
else
  echo "Uso: $0 [user@]machine path"
  exit
fi
