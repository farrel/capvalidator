require 'rubygems'
require 'sinatra'
require 'rcap'
require 'haml'
require 'coderay'
require 'rexml/formatters/pretty'

XML_FORMATTER = REXML::Formatters::Pretty.new( 2 )
XML_FORMATTER.compact = true

get '/' do
  haml( :index )
end


post '/validate' do
  @alert = RCAP::Alert.from_xml( params[ :cap_data ]) rescue RCAP::CAP_1_2::Alert.new
  if @alert.valid?
    @xml_string = ""
    XML_FORMATTER.write( @alert.to_xml_document, @xml_string ) 
  end
  haml( :validate )
end
