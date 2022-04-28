OUTPUT_FILE := tester

SRC_FILES := $(wildcard *.cpp)

CPP := clang++
FLAGS := -std=c++17 -g
INCLUDE_PATH := -I./inc

#INCLUDE_PATH := -I../libslamin/build/libslamin
#LIBRARY_PATH := -L../libslamin/build
#LIBRARIES := -lslamin -lpthread 

LIBRARIES := -lpthread 

all:
	$(CPP) $(INCLUDE_PATH) $(LIBRARY_PATH) $(SRC_FILES) -o $(OUTPUT_FILE) $(FLAGS) $(LIBRARIES)

clean:
	rm $(OUTPUT_FILE)

run:
	./$(OUTPUT_FILE)
