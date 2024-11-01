rm -rf ./test-out
rm -rf ./docs
mkdir -p ./docs/{images,pdf,scripts}

echo lesliesatin.com > ./docs/CNAME
cp ./*.{xml,html,css,svg,ttf} ./docs
cp ./images/* ./docs/images
cp ./pdf/* ./docs/pdf
cp ./scripts/* ./docs/scripts

echo copied

git add ./docs
git commit -m '🤖 Copied to docs'
git push