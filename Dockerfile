# Creates a web-service to convert PDF articles to HTML
# Uses pdf2htmlEX: https://github.com/coolwanglu/pdf2htmlEX
FROM node:4.4.3

#
# Install git and all dependencies
#
RUN apt-get update
RUN apt-get install -y git cmake autotools-dev libjpeg-dev libtiff5-dev \
	libpng12-dev libgif-dev libxt-dev autoconf automake libtool bzip2 libxml2-dev \
	libuninameslist-dev libspiro-dev python-dev libpango1.0-dev libcairo2-dev \
	chrpath uuid-dev uthash-dev


#
# Clone the pdf2htmlEX fork of fontforge
# compile it
#
RUN git clone https://github.com/coolwanglu/fontforge.git fontforge.git
RUN cd fontforge.git && git checkout pdf2htmlEX && ./autogen.sh && ./configure && make V=1 && make install

#
# Install poppler utils
#
RUN apt-get install -y libpoppler-glib-dev libpoppler-private-dev libpoppler-cpp-dev

#
# Clone and install the pdf2htmlEX git repo
#
RUN git clone git://github.com/coolwanglu/pdf2htmlEX.git
RUN cd pdf2htmlEX && cmake . && make && make install

#
# Copy our web code
#
COPY . /app

# Open port 8000
EXPOSE 8000

# Run our app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
