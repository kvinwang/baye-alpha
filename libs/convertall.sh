for i in *.lib; do
    echo $i
    python -m baye $i
done
for i in *.res; do
    echo $i
    python -m baye $i
done
